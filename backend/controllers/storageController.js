const { MongoClient, GridFSBucket, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Family = require("../models/Family");
const User = require("../models/User");
const Folder = require("../models/Folder");
const File = require("../models/File");
const { console } = require("inspector");

const client = new MongoClient('mongodb://127.0.0.1:27017/lifesync');

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user._id;
    const storageType = req.params.storageType; // 'private' or 'family'
    let uploadDir;

    if (storageType === "private") {
      uploadDir = path.join(
        __dirname,
        "..",
        "uploads",
        "private",
        userId.toString()
      );
    } else if (storageType === "family") {
      const familyId = req.params.familyId;
      if (!familyId) {
        return cb(new Error("Family ID is required for family storage."));
      }
      uploadDir = path.join(
        __dirname,
        "..",
        "uploads",
        "family",
        familyId.toString()
      );
    } else {
      return cb(new Error("Invalid storage type."));
    }

    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Helper function to check if a user belongs to a family
async function isUserInFamily(userId, familyId) {
  try {
    const family = await Family.findById(familyId);
    if (!family) {
      return false;
    }
    return family.members.some((memberId) => memberId.toString() === userId);
  } catch (error) {
    console.error("Error checking user in family:", error);
    return false;
  }
}

// Helper function to get the appropriate bucket (not needed for file system storage)
// const getBucket = async (db, storageType, familyId = null) => {
// };

// Helper function to get parent folder ID from path
const getParentFolderId = async (path, storageType, familyId, userId) => {
  if (path === "/" || path === "" || path === "/Home") {
    return "root"; // Use 'root' as a special identifier for the root directory
  }

  // Remove trailing slash if present
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
  const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf("/"));
  const parentFolderName = parentPath.substring(parentPath.lastIndexOf("/") + 1);

  let query = {
    name: parentFolderName,
    path: parentPath,
  };

  if (storageType === "family") {
    query.family = familyId;
  } else {
    query.user = userId;
  }

  const parentFolder = await Folder.findOne(query);
  return parentFolder ? parentFolder._id : "root";
};

// Helper function to ensure the user has a "Home" folder
const ensureHomeFolderExists = async (userId, storageType, familyId = null) => {
  let homeFolderQuery = {
    name: "Home",
    parentFolder: null, // Root folder has no parent
    path: "/Home", // Assuming /Home as the path for the home folder
  };

  if (storageType === "private") {
    if (!userId) {
      throw new Error("User ID is required for private storage.");
    }
    homeFolderQuery.user = userId;
  } else if (storageType === "family") {
    if (!familyId) {
      throw new Error("Family ID is required for family storage.");
    }
    homeFolderQuery.family = familyId;
  }

  try {
    let homeFolder = await Folder.findOne(homeFolderQuery);

    if (!homeFolder) {
      // Create the 'Home' folder with the user's ID
      homeFolder = new Folder({
        name: "Home",
        parentFolder: null,
        user: storageType === "private" ? userId : undefined,
        family: storageType === "family" ? familyId : undefined,
        path: "/Home",
      });
      await homeFolder.save();
    }
    return homeFolder._id;
  } catch (error) {
    console.error("Error in ensureHomeFolderExists:", error);
    throw error; // Re-throw the error after logging
  }
};

// Upload a file
const uploadFile = async (req, res) => {
  try {
    const storageType = req.params.storageType;
    const familyId = req.params.familyId;
    const userId = req.user._id;
    const parentFolderPath = req.body.path || "/";

    // Ensure the user has a Home folder
    const homeFolderId = await ensureHomeFolderExists(
      userId,
      storageType,
      familyId
    );

    // Authorization check
    if (storageType === "family" && !(await isUserInFamily(userId, familyId))) {
      return res
        .status(403)
        .json({ message: "User not authorized for this family" });
    }

    // Determine the parent folder ID (Home folder if the path is root or empty)
    let parentFolderId =
      parentFolderPath === "/" || parentFolderPath === "" || parentFolderPath === "/Home"
        ? homeFolderId
        : await getParentFolderId(
            parentFolderPath,
            storageType,
            familyId,
            userId
          );

    // Construct the full file path
    const fullFilePath = req.file.path;

    // Create a new File document
    const newFile = new File({
      name: req.file.originalname,
      contentType: req.file.mimetype,
      path: fullFilePath, // Store the full path
      size: req.file.size,
      user: storageType === "private" ? userId : undefined,
      family: storageType === "family" ? familyId : undefined,
      parentFolder: parentFolderId,
    });

    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile, // Send back the newly created file information
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

// Download a file
const downloadFile = async (req, res) => {
  try {
    const storageType = req.params.storageType;
    const fileId = req.params.fileId;
    const userId = req.user._id; // Assuming user's ID is available in req.user

    // Fetch the file by its ID
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the file is from private storage and if the current user is the owner
    if (storageType === "private" && file.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to download this file" });
    }

    // Construct the full file path
    const filePath = file.path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set headers for file download
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `attachment; filename="${file.name}"`);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error streaming file" });
      }
    });
  } catch (error) {
    console.error("Error in downloadFile:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// List files and folders
const listFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId", userId);
    const storageType = req.params.storageType;
    const familyId = req.params.familyId;

    const ensureHomeFolderExists = async (userId, storageType, familyId = null) => {
      let homeFolderQuery = {
        parentFolder: null, // Root folder has no parent
        path: `/private/${userId}`,
      };
    
      if (storageType === "private") {
        if (!userId) {
          throw new Error("User ID is required for private storage.");
        }
        homeFolderQuery.user = userId;
      } else if (storageType === "family") {
        if (!familyId) {
          throw new Error("Family ID is required for family storage.");
        }
        homeFolderQuery.family = familyId;
      }
    
      let homeFolder = await Folder.findOne(homeFolderQuery);
      if (!homeFolder) {
        // Create the root folder with the user's ID
        homeFolder = new Folder({
          name: userId,
          parentFolder: null,
          user: storageType === "private" ? userId : undefined,
          family: storageType === "family" ? familyId : undefined,
          path: `/private/${userId}`, // Set the path to /private/<userId>
        });
        await homeFolder.save();
      }
      return homeFolder._id;
    };
    
    const homeFolderId = homeFolder ? homeFolder._id : null;

    // Determine if we are at the root level or a subfolder level
    const isRoot = !req.query.path || req.query.path === "/";
    const isHome = req.query.path === "/Home";
    let requestedFolderId = homeFolderId; // Default to Home folder ID

    if (!isRoot && !isHome) {
      // If not root or home, find the current folder by path
      let folderQuery = { path: req.query.path };
      if (storageType === "private") {
        folderQuery.user = userId;
      } else if (storageType === "family") {
        folderQuery.family = familyId;
      }
      const currentFolder = await Folder.findOne(folderQuery);
      if (!currentFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      requestedFolderId = currentFolder._id;
    }

    // Check authorization based on storage type
    if (
      storageType === "family" &&
      !(await isUserInFamily(userId, familyId))
    ) {
      return res
        .status(403)
        .json({ message: "User not authorized for this family" });
    }

    // Fetch folders
    let folderQuery = { parentFolder: requestedFolderId };
    if (storageType === "private") {
      folderQuery.user = userId;
    } else if (storageType === "family") {
      folderQuery.family = familyId;
    }

    const folders = await Folder.find(folderQuery).lean();

    // Fetch files
    let fileQuery = { parentFolder: requestedFolderId };
    if (storageType === "private") {
      fileQuery.user = userId;
    } else if (storageType === "family") {
      fileQuery.family = familyId;
    }

    const files = await File.find(fileQuery).lean();

    // Combine folders and files into one list
    const items = [
      ...folders.map((folder) => ({
        id: folder._id,
        name: folder.name,
        isDirectory: true,
        path: folder.path,
      })),
      ...files.map((file) => ({
        id: file._id,
        name: file.name,
        isDirectory: false,
        contentType: file.contentType,
        path: file.path,
      })),
    ];

    res.json({ items });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ message: "Error listing files" });
  }
};

// Delete a file
const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user._id;

    // Fetch the file to be deleted
    const fileToDelete = await File.findById(fileId);
    if (!fileToDelete) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the user is authorized to delete the file
    if (
      fileToDelete.user &&
      fileToDelete.user.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this file" });
    }

    // Construct the full file path
    const filePath = fileToDelete.path;

    // Check if the file exists on the file system and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Synchronously delete the file
    }

    // Delete the file record from the database
    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
};

// Create a folder
const createFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, path: requestedPath } = req.body;
    const storageType = req.params.storageType;
    const familyId = req.params.familyId;

    // Ensure the user has a Home folder
    const homeFolder = await ensureHomeFolderExists(
      userId,
      storageType,
      familyId
    );

    // Check authorization based on storage type
    if (storageType === "family" && !(await isUserInFamily(userId, familyId))) {
      return res
        .status(403)
        .json({ message: "User not authorized for this family" });
    }

    let newFolderPath;
    if (
      !requestedPath ||
      requestedPath === "/" ||
      requestedPath === "/Home"
    ) {
      // If creating in the root or Home, set the path based on Home folder
      newFolderPath = path.join("/Home", name);
    } else {
      // For other paths, append the new folder name to the requested path
      newFolderPath = path.join(requestedPath, name);
    }

    // Ensure the new folder path starts with /Home for private storage
    if (storageType === "private" && !newFolderPath.startsWith("/Home")) {
      return res.status(400).json({
        message:
          "Invalid path for private storage. Path must start with /Home",
      });
    }

    // Create the new folder
    const newFolder = new Folder({
      name,
      parentFolder: requestedPath === "/Home" ? homeFolder._id : requestedPath,
      user: storageType === "private" ? userId : null,
      family: storageType === "family" ? familyId : null,
      path: newFolderPath,
    });

    await newFolder.save();

    res.status(201).json({
      message: "Folder created successfully",
      folder: {
        _id: newFolder._id,
        id: newFolder._id,
        name: newFolder.name,
        isDirectory: true,
        path: newFolder.path,
      },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Error creating folder" });
  }
};

// Helper function to recursively delete files and subfolders
const deleteFolderRecursively = async (folderId, storageType, familyId, db) => {
  const folder = await Folder.findById(folderId);
  if (!folder) return;

  // Find and delete subfolders
  const subfolders = await Folder.find({
    parentFolder: folder._id,
    user: folder.user,
    ...(storageType === "family" && { family: familyId }),
  });
  for (const subfolder of subfolders) {
    await deleteFolderRecursively(
      subfolder._id,
      storageType,
      familyId,
      db
    );
  }

  // Find and delete files in the current folder
  const files = await File.find({
    parentFolder: folder._id,
    user: folder.user,
    ...(storageType === "family" && { family: familyId }),
  });
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    await File.findByIdAndDelete(file._id);
  }

  // Delete the current folder
  await Folder.findByIdAndDelete(folder._id);
};

// Delete a folder (and optionally its contents recursively)
const deleteFolder = async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const userId = req.user._id;
    const storageType = req.params.storageType;
    const familyId = req.params.familyId;
    const folderId = req.params.folderId;

    // Check authorization based on storage type
    if (storageType === "family" && !(await isUserInFamily(userId, familyId))) {
      return res
        .status(403)
        .json({ message: "User not authorized for this family" });
    }

    // Fetch the folder to be deleted
    const folderToDelete = await Folder.findById(folderId);
    if (!folderToDelete) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Delete the folder and its contents recursively
    await deleteFolderRecursively(folderId, storageType, familyId, db);

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Error deleting folder" });
  } finally {
    client.close();
  }
};

// Helper function to construct a new path based on the destination folder
const constructNewPath = async (destinationPath, fileName) => {
  let newPath = path.join(destinationPath, fileName);
  return newPath;
};

const moveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newPath } = req.body; // The new path should include the new parent folder path and the filename

    // Fetch the file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the new path exists
    if (!fs.existsSync(newPath)) {
      return res.status(400).json({ message: "New path does not exist" });
    }

    // Move the file
    fs.rename(file.path, newPath, async (err) => {
      if (err) {
        console.error("Error moving file:", err);
        return res.status(500).json({ message: "Error moving file" });
      }

      // Update the file's path in the database
      file.path = newPath;
      await file.save();

      res.status(200).json({ message: "File moved successfully", file });
    });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ message: "Error moving file" });
  }
};

const moveFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newPath } = req.body; // New path for the folder

    // Fetch the folder
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if the new path exists
    if (!fs.existsSync(newPath)) {
      return res.status(400).json({ message: "New path does not exist" });
    }

    // Move the folder
    fs.rename(folder.path, newPath, async (err) => {
      if (err) {
        console.error("Error moving folder:", err);
        return res.status(500).json({ message: "Error moving folder" });
      }

      // Update the folder's path in the database
      folder.path = newPath;
      await folder.save();

      res.status(200).json({ message: "Folder moved successfully", folder });
    });
  } catch (error) {
    console.error("Error moving folder:", error);
    res.status(500).json({ message: "Error moving folder" });
  }
};

const copyFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newPath } = req.body;

    // Fetch the file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the destination path exists
    const destinationDir = path.dirname(newPath);
    if (!fs.existsSync(destinationDir)) {
      return res
        .status(400)
        .json({ message: "Destination path does not exist" });
    }

    // Copy the file
    fs.copyFile(file.path, newPath, async (err) => {
      if (err) {
        console.error("Error copying file:", err);
        return res.status(500).json({ message: "Error copying file" });
      }

      // Create a new file record in the database
      const newFile = new File({
        name: file.name,
        contentType: file.contentType,
        path: newPath,
        size: file.size,
        uploadDate: new Date(),
        user: file.user,
        family: file.family,
        parentFolder: file.parentFolder, // This should be updated to the new parent folder if needed
      });

      await newFile.save();

      res.status(201).json({ message: "File copied successfully", file: newFile });
    });
  } catch (error) {
    console.error("Error copying file:", error);
    res.status(500).json({ message: "Error copying file" });
  }
};

const copyFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newPath } = req.body;

    // Fetch the folder
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if the destination path exists
    const destinationDir = path.dirname(newPath);
    if (!fs.existsSync(destinationDir)) {
      return res
        .status(400)
        .json({ message: "Destination path does not exist" });
    }

    // Function to copy folder recursively
    const copyFolderRecursive = async (source, target) => {
      // Create target folder if it doesn't exist
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }

      // Read the contents of the source directory
      const items = fs.readdirSync(source);
      for (const item of items) {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
          // Recursively copy subfolders
          await copyFolderRecursive(sourcePath, targetPath);
        } else {
          // Copy files
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    };

    // Copy the folder recursively
    await copyFolderRecursive(folder.path, newPath);

    // Update folder path in the database
    folder.path = newPath;
    await folder.save();

    res.status(200).json({ message: "Folder copied successfully", folder });
  } catch (error) {
    console.error("Error copying folder:", error);
    res.status(500).json({ message: "Error copying folder" });
  }
};

const renameFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;

    // Fetch the file
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Construct the new file path
    const fileExtension = path.extname(file.path);
    const newFilePath = path.join(
      path.dirname(file.path),
      newName + fileExtension
    );

    // Rename the file
    fs.rename(file.path, newFilePath, async (err) => {
      if (err) {
        console.error("Error renaming file:", err);
        return res.status(500).json({ message: "Error renaming file" });
      }

      // Update the file's name and path in the database
      file.name = newName + fileExtension;
      file.path = newFilePath;
      await file.save();

      res.status(200).json({ message: "File renamed successfully", file });
    });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({ message: "Error renaming file" });
  }
};

const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { newName } = req.body;

    // Fetch the folder
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Construct the new folder path
    const newFolderPath = path.join(path.dirname(folder.path), newName);

    // Rename the folder
    fs.rename(folder.path, newFolderPath, async (err) => {
      if (err) {
        console.error("Error renaming folder:", err);
        return res.status(500).json({ message: "Error renaming folder" });
      }

      // Update the folder's name and path in the database
      folder.name = newName;
      folder.path = newFolderPath;
      await folder.save();

      res.status(200).json({ message: "Folder renamed successfully", folder });
    });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({ message: "Error renaming folder" });
  }
};

module.exports = {
  upload,
  uploadFile,
  downloadFile,
  listFiles,
  deleteFile,
  createFolder,
  deleteFolder,
  moveFile,
  moveFolder,
  copyFile,
  copyFolder,
  renameFile,
  renameFolder
};
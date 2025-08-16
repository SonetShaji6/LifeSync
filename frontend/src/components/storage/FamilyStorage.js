import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosConfig";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FileManager } from "@cubone/react-file-manager";

const FamilyStorage = ({ user, familyId }) => {
  const [isLoading, setIsLoading] = useState(false);
  // const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const fileManagerApiRef = useRef();

  const fetchFiles = async (path) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/storage/family/list", {
        params: { path: path, familyId: familyId }, // Pass familyId here
      });
      const formattedFiles = response.data.items.map((item) => ({
        ...item,
        path: item.path,
      }));
      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error fetching files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, familyId]);

  const handleFileUploaded = (response) => {
    setFiles((prevFiles) => [...prevFiles, response.file]);
  };

  const handleCreateFolder = async (folderName, parentFolder) => {
    setIsLoading(true);
    try {
      const parentFolderPath =
        parentFolder.path === "/"
          ? ""
          : parentFolder.path.replace(/^\/+/, "");

      const newFolderPath = `${parentFolderPath}/${folderName}`;

      const response = await axios.post(
        `/storage/family/create-folder/${familyId}`,
        {
          name: folderName,
          parentFolder: parentFolder.id,
          path: newFolderPath,
        }
      );

      setFiles((prevFiles) => [
        ...prevFiles,
        {
          ...response.data.folder,
          isDirectory: true,
          path: newFolderPath,
        },
      ]);

      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(
        "Error creating folder: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (selectedFiles) => {
    setIsLoading(true);
    try {
      for (const file of selectedFiles) {
        if (file.isDirectory) {
          await axios.delete(
            `/storage/family/delete-folder/${familyId}/${file.id}`
          );
          toast.success(`Folder "${file.name}" deleted successfully.`);
        } else {
          await axios.delete(`/storage/family/delete/${familyId}/${file.id}`);
          toast.success(`File "${file.name}" deleted successfully.`);
        }
      }
      await fetchFiles(currentPath);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        `Error deleting item: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (file, newName) => {
    setIsLoading(true);
    try {
      let response;
      if (file.isDirectory) {
        response = await axios.put(
          `/storage/family/rename-folder/${familyId}/${file.id}`,
          { newName }
        );
        toast.success("Folder renamed successfully");
      } else {
        response = await axios.put(
          `/storage/family/rename-file/${familyId}/${file.id}`,
          { newName }
        );
        toast.success("File renamed successfully");
      }
      setFiles((prevFiles) =>
        prevFiles.map((item) =>
          item.id === file.id ? { ...item, name: response.data.name } : item
        )
      );
    } catch (error) {
      console.error("Error renaming item:", error);
      toast.error(
        `Error renaming item: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async (
    filesToPaste,
    destinationFolder,
    operationType
  ) => {
    setIsLoading(true);
    try {
      for (const file of filesToPaste) {
        if (operationType === "move") {
          if (file.isDirectory) {
            await axios.patch(
              `/storage/family/move-folder/${familyId}/${file.id}`,
              {
                newParentFolderId: destinationFolder.id,
                newPath: `${destinationFolder.path}/${file.name}`,
              }
            );
          } else {
            await axios.patch(
              `/storage/family/move-file/${familyId}/${file.id}`,
              {
                newParentFolderId: destinationFolder.id,
                newPath: `${destinationFolder.path}/${file.name}`,
              }
            );
          }
        } else if (operationType === "copy") {
          if (file.isDirectory) {
            await axios.post(
              `/storage/family/copy-folder/${familyId}/${file.id}`,
              {
                newParentFolderId: destinationFolder.id,
                newPath: `${destinationFolder.path}/${file.name}`,
              }
            );
          } else {
            await axios.post(
              `/storage/family/copy-file/${familyId}/${file.id}`,
              {
                newParentFolderId: destinationFolder.id,
                newPath: `${destinationFolder.path}/${file.name}`,
              }
            );
          }
        }
      }
      await fetchFiles(currentPath);
      toast.success("Items pasted successfully");
    } catch (error) {
      console.error("Error during paste operation:", error);
      toast.error(
        `Error during paste operation: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (selectedFiles) => {
    try {
      for (const file of selectedFiles) {
        if (!file.isDirectory) {
          const response = await axios.get(
            `/storage/family/download/${familyId}/${file.id}`,
            {
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      toast.success("Download successful");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(
        `Error downloading file: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };
  const [files, setFiles] = useState([
    {
      name: "Documents",
      isDirectory: true, // Folder
      path: "/Documents", // Located in Root directory
      updatedAt: "2024-09-09T10:30:00Z", // Last updated time
    },
    {
      name: "Pictures",
      isDirectory: true,
      path: "/Pictures", // Located in Root directory as well
      updatedAt: "2024-09-09T11:00:00Z",
    },
    {
      name: "Pic.png",
      isDirectory: false, // File
      path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
      updatedAt: "2024-09-08T16:45:00Z",
      size: 2048, // File size in bytes (example: 2 KB)
    },
  ]);
  return (
    <motion.div
      className="p-4 text-black"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Family Storage</h2>

      <div className="mt-4 w-full h-[500px]">
        <FileManager
          api={fileManagerApiRef}
          files={files}
          rootTitle={`Family Storage`}
          acceptedFileTypes={".txt,.png,.pdf,.jpg,.jpeg,.docx,.xlsx"}
          enableFilePreview={true}
          filePreviewPath={`http://localhost:5000/`}
          fileUploadConfig={{
            url: `/storage/family/upload/${familyId}`, // Add familyId to the URL
            headers: { Authorization: `Bearer ${user.token}` },
          }}
          onFileUploaded={handleFileUploaded}
          onCreateFolder={handleCreateFolder}
          onDelete={handleDelete}
          onRename={handleRename}
          onPaste={handlePaste}
          onDownload={handleDownload}
          // onError={handleError}
          height={"100%"}
        />
      </div>
    </motion.div>
  );
};

export default FamilyStorage;
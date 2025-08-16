npm install tailwindcss postcss autoprefixer react-router-dom framer-motion
npx tailwindcss init


express: Web framework.
mongoose: MongoDB ORM.
bcryptjs: For password hashing.
express-session: For session handling.
connect-mongo: To store sessions in MongoDB.
cors: To allow requests from your frontend.
body-parser: To parse incoming requests.



Okay, I understand. You want to implement folder management features within your `PrivateStorage` (and potentially `FamilyStorage`) component, allowing users to create, navigate, and delete folders, similar to a file manager.

Here's how you can implement this functionality, along with the necessary backend modifications:

**1. Backend Changes (Conceptual):**

*   **Data Modeling:**
    *   **Option 1: (Embedded Documents):** You could modify your `File` model (if you have one) to support a `parentFolder` field, which could be a reference to another `File` document representing a folder. This approach can work for simpler folder structures, but might become complex to query for deeply nested structures.
        ```javascript
        // Example File model with parentFolder
        const fileSchema = new mongoose.Schema({
          // ... other fields
          isDirectory: { type: Boolean, default: false },
          parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'File' }, // Reference to parent folder
        });
        ```
    *   **Option 2 (Separate Folder Model):** A more robust and scalable approach is to create a separate `Folder` model. This model could have fields like:
        ```javascript
        const mongoose = require('mongoose');

        const folderSchema = new mongoose.Schema({
          name: { type: String, required: true },
          parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }, // Reference to parent
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Or Family if in family storage
          // ... other relevant fields
        });

        const Folder = mongoose.model('Folder', folderSchema);
        module.exports = Folder;
        ```
*   **API Endpoints:** You'll need to update your `storageController.js` and `storageRoutes.js` to handle the following:
    *   **`GET /api/storage/:storageType/list/:familyId?`:**
        *   Modify the `listFiles` function to:
            *   Query for both `File` and `Folder` documents (or use your chosen data modeling approach).
            *   Filter by `parentFolder` to get the contents of a specific folder.
            *   Return a list of both files and subfolders within the requested folder.
    *   **`POST /api/storage/:storageType/create-folder/:familyId?`:**
        *   Create a new `Folder` document (or a `File` document with `isDirectory: true`).
        *   Set the `parentFolder` field to the ID of the parent folder (if provided).
        *   Associate the folder with a `User` (for private storage) or `Family` (for family storage).
    *   **`DELETE /api/storage/:storageType/delete-folder/:familyId?/:folderId`:**
        *   Delete the specified `Folder` document (and all its contents recursively if you want that behavior).
        *   Ensure that only the owner or authorized users can delete folders.

**2. Frontend Changes (`PrivateStorage.js`):**

*   **State:**
    *   `currentPath`: An array of folder IDs representing the current path (e.g., `['rootFolderId', 'subFolder1Id', 'subFolder2Id']`).
    *   `items`: An array to store the files and folders in the current directory.

*   **`useEffect`:**
    *   Modify the `useEffect` that fetches the initial file list to also:
        *   Fetch the contents of the root directory (`/` or an equivalent) by default.
        *   Update the `items` state with the fetched files and folders.

*   **Functions:**
    *   `handleFolderClick(folderId)`:
        *   Update `currentPath` by adding the `folderId` to the array.
        *   Fetch the contents of the new folder (using the updated `currentPath`).
        *   Update the `items` state.
    *   `handleBackClick()`:
        *   Remove the last folder ID from `currentPath`.
        *   Fetch the contents of the parent folder.
        *   Update the `items` state.
    *   `handleCreateFolder()`:
        *   Prompt the user for a folder name (e.g., using a modal or an input field).
        *   Make an API call to `POST /api/storage/private/create-folder` (or the equivalent for family storage).
        *   Send the folder name and the current `parentFolder` ID (the last element in `currentPath`).
        *   Update the `items` state to include the newly created folder.
    *   `handleDeleteFolder(folderId)`:
        *   Confirm deletion with the user.
        *   Make an API call to `DELETE /api/storage/private/delete-folder/:folderId`.
        *   Update the `items` state to remove the deleted folder (and its contents if applicable).

*   **UI:**
    *   Display `items` in a list, differentiating between files and folders (e.g., using different icons).
    *   Implement "Back" functionality (e.g., a ".." or "Back" button) to navigate up the folder hierarchy.
    *   Add a button or mechanism to trigger `handleCreateFolder()`.
    *   Add a button or mechanism (e.g., a context menu) to trigger `handleDeleteFolder(folderId)`.

**Example Code Snippets (Frontend):**

```javascript
// ... other imports in PrivateStorage.js

const PrivateStorage = () => {
  // ... other state variables
  const [currentPath, setCurrentPath] = useState(['root']); // Start at root
  const [items, setItems] = useState([]);

  // Fetch initial file/folder list on mount and when currentPath changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!isLocked && isPinSet) {
        // Assuming isLocked is false and isPinSet is true when unlocked
        try {
          const parentFolderId =
            currentPath.length > 0 ? currentPath[currentPath.length - 1] : "root";
          const response = await axios.get(
            `/api/storage/private/list?folderId=${parentFolderId}`
          );
          setItems(response.data.items);
        } catch (error) {
          console.error("Error fetching items:", error);
          toast.error("Error fetching items");
        }
      }
    };

    fetchItems();
  }, [isLocked, isPinSet, currentPath]); // Add currentPath as dependency

  // ... other functions (handleUnlock, handleSetPin, etc.)

  const handleFolderClick = (folderId) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const handleBackClick = () => {
    const newPath = [...currentPath];
    newPath.pop(); // Go up one level
    setCurrentPath(newPath);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:"); // Simple prompt for demo
    if (folderName) {
      try {
        const parentFolderId =
          currentPath.length > 0 ? currentPath[currentPath.length - 1] : "root";
        const response = await axios.post(
          `/api/storage/private/create-folder`,
          {
            name: folderName,
            parentFolder: parentFolderId,
          }
        );
        // Add the new folder to the items list
        setItems([...items, response.data.folder]);
        toast.success("Folder created!");
      } catch (error) {
        console.error("Error creating folder:", error);
        toast.error("Error creating folder");
      }
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm("Are you sure you want to delete this folder?")) {
      try {
        await axios.delete(`/api/storage/private/delete-folder/${folderId}`);
        // Remove the deleted folder from the items list
        setItems(items.filter((item) => item.id !== folderId));
        toast.success("Folder deleted!");
      } catch (error) {
        console.error("Error deleting folder:", error);
        toast.error("Error deleting folder");
      }
    }
  };

  // ... UI rendering (in the return statement)
  return (
    <motion.div
    // ... (other parts of the component)
  >
      {/* ... PIN handling UI ... */}
  
      {/* File Management Section (Unlocked) */}
      {!isLocked && isPinSet && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <button onClick={handleBackClick} disabled={currentPath.length <= 1}>
              Back
            </button>
            <button onClick={handleCreateFolder} className="ml-2">
              Create Folder
            </button>
          </div>
  
          {/* Display current path */}
          <p>
            Current Path: /
            {currentPath.slice(1).map((folderId) => {
              const folder = items.find((item) => item.id === folderId);
              return folder ? <span key={folderId}>/{folder.name}</span> : null;
            })}
          </p>
  
          {/* List items */}
          <ul>
            {items.map((item) => (
              <li key={item.id} className="flex items-center">
                {item.isDirectory ? (
                  <>
                    <span
                      className="cursor-pointer"
                      onClick={() => handleFolderClick(item.id)}
                    >
                      📁 {item.name}
                    </span>
                    <button
                      onClick={() => handleDeleteFolder(item.id)}
                      className="ml-2"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <span>📄 {item.name}</span>
                    {/* Add download/delete buttons for files here */}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
  
};

export default PrivateStorage;
```

**3. Backend Example (`storageController.js`):**

```javascript
const { GridFSBucket, ObjectId } = require("mongodb");
const Folder = require("../models/Folder"); // Import the Folder model
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contentType: { type: String, required: true },
  path: { type: String, required: true },
  isDirectory: { type: Boolean, default: false },
  size: { type: Number }, // Optional: Store file size
  uploadDate: { type: Date, default: Date.now }, // Optional: Store upload date
  gridfsId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the file in GridFS
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who uploaded the file (for private storage)
  family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }, // Reference to the family (for family storage)
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // Reference to the parent folder
  // Add other metadata fields as needed
});

const File = mongoose.model('File', fileSchema);
module.exports = File;

// ... (other functions in storageController.js)
const getParentFolderId = async (db, path, storageType, familyId, userId) => {
  if (path === '/' || path === '') {
    return 'root'; // Use 'root' as a special identifier for the root directory
  }

  // Remove trailing slash if present
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
  const parentFolderName = parentPath.substring(parentPath.lastIndexOf('/') + 1);

  let query = { 
    name: parentFolderName, 
    path: parentPath 
  };

  if (storageType === 'family') {
    query.family = familyId;
  } else {
    query.user = userId;
  }

  const parentFolder = await Folder.findOne(query);
  return parentFolder ? parentFolder._id : 'root';
};

// Helper function to create a folder (if it doesn't exist) and return its ID
const ensureFolderExists = async (db, folderName, parentFolderId, storageType, familyId, userId) => {
  let folderQuery = {
    name: folderName,
    parentFolder: parentFolderId,
  };

  if (storageType === 'family') {
    folderQuery.family = familyId;
  } else {
    folderQuery.user = userId;
  }

  let folder = await Folder.findOne(folderQuery);
  if (!folder) {
    folder = new Folder({
      name: folderName,
      parentFolder: parentFolderId,
      user: storageType === 'private' ? userId : undefined,
      family: storageType === 'family' ? familyId : undefined,
    });
    await folder.save();
  }
  return folder._id;
};

// ... (other functions in storageController.js)

exports.uploadFile = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await client.connect();
    const db = client.db();

    const storageType = req.params.storageType;
    const familyId = req.params.familyId;
    const userId = req.user.userId;
    const requestedPath = req.body.path || '/';

    // Authorization check (ensure user belongs to family or is uploading to private storage)
    if (storageType === 'family' && !await isUserInFamily(userId, familyId)) {
      return res.status(403).json({ message: 'User not authorized for this family' });
    }

    const parentFolderId = await getParentFolderId(db, requestedPath, storageType, familyId, userId);

    const bucket = await getBucket(db, storageType, familyId);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        contentType: req.file.mimetype,
        userId: userId,
        path: requestedPath,
      },
      session
    });

    uploadStream.write(req.file.buffer);
    uploadStream.end();

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const newFile = new File({
      name: req.file.originalname,
      contentType: req.file.mimetype,
      path: requestedPath,
      isDirectory: false,
      size: req.file.size,
      gridfsId: uploadStream.id,
      user: storageType === 'private' ? userId : undefined,
      family: storageType === 'family' ? familyId : undefined,
      parentFolder: parentFolderId,
    });
    await newFile.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: uploadStream.id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  } finally {
    session.endSession();
    client.close();
  }
};

// List files and folders
exports.listFiles = async (req, res) => {
  try {
    await client.connect();
    const db = client.db();
    const userId = req.user.userId;
    const storageType = req.params.storageType;
    const familyId = req.params.familyId;
    const folderId = req.query.folderId === 'root' ? 'root' : new ObjectId(req.query.folderId);

    // Check authorization (ensure user belongs to family or is accessing private storage)
    if (storageType === 'family' && !await isUserInFamily(userId, familyId)) {
      return res.status(403).json({ message: 'User not authorized for this family' });
    }

    // Fetch folders
    let folderQuery = { parentFolder: folderId };
    if (storageType === 'private') {
      folderQuery.user = userId;
    } else if (storageType === 'family') {
      folderQuery.family = familyId;
    }

    const folders = await Folder.find(folderQuery).lean();

    // Fetch files
    let fileQuery = { parentFolder: folderId };
    if (storageType === 'private') {
      fileQuery.user = userId;
    } else if (storageType === 'family') {
      fileQuery.family = familyId;
    }

    const files = await File.find(fileQuery).lean();

    // Combine folders and files into one list
    const items = [
      ...folders.map(folder => ({
        id: folder._id,
        name: folder.name,
        isDirectory: true,
        path: folder.path
      })),
      ...files.map(file => ({
        id: file._id,
        name: file.name,
        isDirectory: false,
        contentType: file.contentType,
        path: file.path
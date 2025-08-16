import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosConfig";
import { motion } from "framer-motion";
import { FaUnlock, FaSave, FaEdit } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { FileManager } from "@cubone/react-file-manager";
import path from "path-browserify";
import "@cubone/react-file-manager/dist/style.css";

const PrivateStorage = ({ user }) => {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isLocked, setIsLocked] = useState(true);
  const [isPinSet, setIsPinSet] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmNewPin, setConfirmNewPin] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  // const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const fileManagerApiRef = useRef(null);

  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const response = await axios.get("/user/pin-status");
        setIsPinSet(response.data.isSet);
        setIsLocked(response.data.isSet);
      } catch (error) {
        console.error("Error checking PIN status:", error);
        toast.error("Error checking PIN status");
      }
    };
    checkPinStatus();
  }, []);

  const fetchFiles = async (path) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/storage/private/list", {
        params: { path },
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
    if (!isLocked && isPinSet) {
      fetchFiles(currentPath);
    }
  }, [isLocked, isPinSet, currentPath]);

  const handleFileUploaded = (response) => {
    const newFile = response.file; // Adjust according to your API response
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  const handleCreateFolder = async (newFolderName, currentFolder) => {
    setIsLoading(true);
    try {
      const newFolderPath = path.join(currentFolder.path, newFolderName);
      const response = await axios.post("/storage/private/create-folder", {
        name: newFolderName,
        path: newFolderPath,
      });
      setFiles((prevFiles) => [
        ...prevFiles,
        {
          ...response.data.folder,
          isDirectory: true,
        },
      ]);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (selectedFiles) => {
    setIsLoading(true);
    try {
      for (const file of selectedFiles) {
        const endpoint = file.isDirectory
          ? `/storage/private/delete-folder/${file.id}`
          : `/storage/private/delete-file/${file.id}`;
        await axios.delete(endpoint);
      }
      await fetchFiles(currentPath);
      toast.success("Items deleted successfully");
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Error deleting items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (file, newName) => {
    setIsLoading(true);
    try {
      const endpoint = file.isDirectory
        ? `/storage/private/rename-folder/${file.id}`
        : `/storage/private/rename-file/${file.id}`;
      await axios.put(endpoint, { newName });
      await fetchFiles(currentPath);
      toast.success("Item renamed successfully");
    } catch (error) {
      console.error("Error renaming item:", error);
      toast.error("Error renaming item");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async (selectedFiles, destination, operationType) => {
    setIsLoading(true);
    try {
      for (const file of selectedFiles) {
        const destinationPath = path.join(
          destination.path,
          path.basename(file.path)
        );
        const endpoint = operationType === "move"
          ? file.isDirectory
            ? `/storage/private/move-folder/${file.id}`
            : `/storage/private/move-file/${file.id}`
          : file.isDirectory
          ? `/storage/private/copy-folder/${file.id}`
          : `/storage/private/copy-file/${file.id}`;
        const method = operationType === "move" ? "patch" : "post";
        await axios[method](endpoint, { newPath: destinationPath });
      }
      await fetchFiles(currentPath);
      toast.success("Items pasted successfully");
    } catch (error) {
      console.error("Error during paste operation:", error);
      toast.error("Error during paste operation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (selectedFiles) => {
    try {
      for (const file of selectedFiles) {
        if (!file.isDirectory) {
          const response = await axios.get(
            `/storage/private/download/${file.id}`,
            { responseType: "blob" }
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
      toast.error("Error downloading file");
    }
  };

  const onFileClick = (file) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
    } else {
      handleDownload([file]);
    }
  };

  const handleNavigation = (newPath) => {
    setCurrentPath(newPath);
    fetchFiles(newPath);
  };

  const handlePinInputChange = (index, value) => {
    const newPinValue = [...pin];
    newPinValue[index] = value;
    if (value && index < 5) {
      document.getElementById(`pin-input-${index + 1}`).focus();
    }
    setPin(newPinValue);
  };

  const handleNewPinInputChange = (index, value) => {
    const newPinValue = [...newPin];
    newPinValue[index] = value;
    if (value && index < 5) {
      document.getElementById(`new-pin-input-${index + 1}`).focus();
    }
    setNewPin(newPinValue);
  };

  const handleConfirmNewPinInputChange = (index, value) => {
    const newPinValue = [...confirmNewPin];
    newPinValue[index] = value;
    if (value && index < 5) {
      document.getElementById(`confirm-new-pin-input-${index + 1}`).focus();
    }
    setConfirmNewPin(newPinValue);
  };

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/user/verify-pin", {
        pin: pin.join("")
      });
      if (response.data.isValid) {
        setIsLocked(false);
        setPin(["", "", "", "", "", ""]);
        toast.success("Storage unlocked!");
      } else {
        toast.error("Incorrect PIN.");
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      toast.error("Error verifying PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPin = async () => {
    if (newPin.join("").length !== 6 || newPin.join("") !== confirmNewPin.join("")) {
      toast.error("PIN must be 6 digits and match the confirmation PIN.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/user/set-pin", {
        pin: newPin.join("")
      });
      if (response.data.success) {
        setIsPinSet(true);
        setIsLocked(true);
        setNewPin(["", "", "", "", "", ""]);
        setConfirmNewPin(["", "", "", "", "", ""]);
        toast.success("PIN set successfully!");
      } else {
        toast.error("Failed to set PIN.");
      }
    } catch (error) {
      console.error("Error setting PIN:", error);
      toast.error("Error setting PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (newPin.join("").length !== 6 || newPin.join("") !== confirmNewPin.join("")) {
      toast.error("PIN must be 6 digits and match the confirmation PIN.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/user/change-pin", {
        pin: newPin.join("")
      });
      if (response.data.success) {
        setShowChangePin(false);
        setNewPin(["", "", "", "", "", ""]);
        setConfirmNewPin(["", "", "", "", "", ""]);
        toast.success("PIN changed successfully!");
      } else {
        toast.error("Failed to change PIN.");
      }
    } catch (error) {
      console.error("Error changing PIN:", error);
      toast.error("Error changing PIN");
    } finally {
      setIsLoading(false);
    }
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
    <motion.div className="p-4 text-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-black">
        {isLocked ? "Unlock Private Storage" : "Private Storage"}
      </h2>

      {isLocked ? (
        <div>
          <div className="flex items-center justify-center">
            {pin.map((digit, index) => (
              <motion.input
                key={index}
                id={`pin-input-${index}`}
                type="password"
                maxLength="1"
                value={digit}
                onChange={(e) => handlePinInputChange(index, e.target.value)}
                className="w-12 h-12 border border-gray-400 rounded-lg text-center text-2xl mx-1"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <motion.button
              onClick={handleUnlock}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              disabled={isLoading}
            >
              {isLoading ? "Unlocking..." : <><FaUnlock className="mr-2" />Unlock</>}
            </motion.button>
          </div>
        </div>
      ) : (
        <div>
          
          {isPinSet ? (
            <FileManager
              api={fileManagerApiRef}
              files={files}
              initialPath={currentPath}
              acceptedFileTypes=".txt,.png,.pdf,.jpg,.jpeg,.docx,.xlsx"
              enableFilePreview={true}
              fileUploadConfig={{
                url: "/storage/private",
                headers: { Authorization: `Bearer ${user.token}` },
              }}
              onFileClick={onFileClick}
              onFileUploaded={handleFileUploaded}
              onCreateFolder={handleCreateFolder}
              onDelete={handleDelete}
              onRename={handleRename}
              onPaste={handlePaste}
              onDownload={handleDownload}
              onNavigation={handleNavigation}
              height="100%"
            />
          ) : (
            <div>
              <p className="text-center mb-2">Set a PIN to secure your private storage:</p>
              <div className="flex justify-center">
                {newPin.map((digit, index) => (
                  <motion.input
                    key={index}
                    id={`new-pin-input-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleNewPinInputChange(index, e.target.value)}
                    className="w-12 h-12 border border-gray-400 rounded-lg text-center text-2xl mx-1"
                  />
                ))}
              </div>
              <div className="flex justify-center mt-2">
                {confirmNewPin.map((digit, index) => (
                  <motion.input
                    key={index}
                    id={`confirm-new-pin-input-${index}`}
                    type="password"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleConfirmNewPinInputChange(index, e.target.value)}
                    className="w-12 h-12 border border-gray-400 rounded-lg text-center text-2xl mx-1"
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <motion.button
                  onClick={handleSetPin}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Setting PIN..." : <><FaSave className="mr-2" />Set PIN</>}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PrivateStorage;

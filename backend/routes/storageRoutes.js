const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");
const protect = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer();

// File upload (for both family and private storage)
router.post(
  "/api/storage/:storageType/upload/:familyId?",
  protect,
  upload.single("file"),
  storageController.uploadFile
);

// File download
router.get(
  "/api/storage/:storageType/download/:fileId",
  protect,
  storageController.downloadFile
);

// List files and folders
router.get(
  "/api/storage/:storageType/list",
  protect,
  storageController.listFiles
);

// Delete file
router.delete(
  "/api/storage/:storageType/delete-file/:fileId",
  protect,
  storageController.deleteFile
);

// Create folder
router.post(
  "/api/storage/:storageType/create-folder/:familyId?",
  protect,
  storageController.createFolder
);

// Delete folder
router.delete(
  "/api/storage/:storageType/delete-folder/:familyId?/:folderId",
  protect,
  storageController.deleteFolder
);

// Move file
router.patch(
  "/api/storage/:storageType/move-file/:fileId",
  protect,
  storageController.moveFile
);

// Move folder
router.patch(
  "/api/storage/:storageType/move-folder/:folderId",
  protect,
  storageController.moveFolder
);

// Copy file
router.post(
  "/api/storage/:storageType/copy-file/:fileId",
  protect,
  storageController.copyFile
);

// Copy folder
router.post(
  "/api/storage/:storageType/copy-folder/:folderId",
  protect,
  storageController.copyFolder
);

// Rename file
router.put(
  "/api/storage/:storageType/rename-file/:fileId",
  protect,
  storageController.renameFile
);

// Rename folder
router.put(
  "/api/storage/:storageType/rename-folder/:folderId",
  protect,
  storageController.renameFolder
);

module.exports = router;
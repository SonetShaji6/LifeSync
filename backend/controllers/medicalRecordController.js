const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const MedicalRecord = require("../models/MedicalRecord");
const multer = require("multer");

// Configure multer for file storage in the project directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.user;
    const uploadDir = path.join(
      __dirname,
      "..",
      "uploads",
      "medical-records",
      userId
    );

    // Create the user-specific directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Define the file name (using a timestamp to avoid collisions)
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Create a new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const newRecord = new MedicalRecord({
      ...req.body,
    });

    if (req.file) {
      // Store the file path relative to your project
      newRecord.file = {
        path: req.file.path,
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      };
    }

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Error creating medical record:", error);
    res.status(500).json({ message: "Failed to create medical record" });
  }
};

// Get all medical records for a user
const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { familyId, recordType, startDate, endDate } = req.query;

    let query = { user: userId };

    if (familyId) {
      query.family = familyId;
    }

    if (recordType) {
      query.recordType = recordType;
    }

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await MedicalRecord.find(query);
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ message: "Failed to fetch medical records" });
  }
};

// Get a specific medical record by ID
const getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error("Error fetching medical record:", error);
    res.status(500).json({ message: "Failed to fetch medical record" });
  }
};

// Update a medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.recordId,
      req.body,
      { new: true }
    );
    if (!updatedRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json({ message: "Failed to update medical record" });
  }
};

// Delete a medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const deletedRecord = await MedicalRecord.findByIdAndDelete(
      req.params.recordId
    );
    if (!deletedRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    res.status(200).json({ message: "Medical record deleted" });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json({ message: "Failed to delete medical record" });
  }
};

// Toggle sharing of a medical record
const toggleShareMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.recordId);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }
    record.isShared = !record.isShared;
    await record.save();
    res.status(200).json({
      message: "Medical record sharing status updated",
      isShared: record.isShared,
    });
  } catch (error) {
    console.error("Error updating medical record sharing status:", error);
    res
      .status(500)
      .json({ message: "Failed to update sharing status for medical record" });
  }
};

const downloadMedicalRecordFile = async (req, res) => {
  try {
    const recordId = req.params.recordId;

    // Fetch the medical record to get the file path
    const record = await MedicalRecord.findById(recordId);
    console.log("record", record);
    if (!record || !record.file || !record.file.path) {
      return res.status(404).json({ message: "File not found" });
    }
    
    const filePath = record.file.path;
    console.log("filePath", filePath);
    // Check if file exists
   
    res.status(200).json({
      filePath: record.file.path, // Send the relative file path
      contentType: record.file.contentType,
      fileName: record.file.filename,
    });

  } catch (error) {
    console.error("Error fetching file details:", error);
    res.status(500).json({ message: "Failed to fetch file details" });
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  toggleShareMedicalRecord,
  downloadMedicalRecordFile,
  upload, // Export upload as a named export
};
const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
  },
  recordType: {
    type: String,
    required: true,
    enum: ["lab result", "imaging report", "clinical note", "prescription"], // Example types
  },
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
  },
  doctor: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Can be a String or a structured Object
  },
  file: {
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    filename: {
      type: String,
    },
    contentType: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

module.exports = MedicalRecord;
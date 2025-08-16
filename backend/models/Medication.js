const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
  },
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  doctor: {
    type: String,
  },
  notes: {
    type: String,
  },
  reminder: {
    type: Boolean,
    default: false,
  },
  reminderTimes: [
    {
      type: String, // Store times in HH:MM format
    },
  ],
  isShared: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Medication = mongoose.model("Medication", medicationSchema);

module.exports = Medication;
const Medication = require("../models/Medication");

// Create a new medication
exports.createMedication = async (req, res) => {
  try {
    const newMedication = new Medication({
      ...req.body,
    });
    await newMedication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    console.error("Error creating medication:", error);
    res.status(500).json({ message: "Failed to create medication" });
  }
};

// Get all medications for a user
exports.getMedications = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { familyId } = req.query;

    let query = { user: userId };
    
    if (familyId) {
      query.family = familyId;
    }

    const medications = await Medication.find(query);
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ message: "Failed to fetch medications" });
  }
};

// Get a specific medication by ID
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.medicationId);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }
    res.status(200).json(medication);
  } catch (error) {
    console.error("Error fetching medication:", error);
    res.status(500).json({ message: "Failed to fetch medication" });
  }
};

// Update a medication
exports.updateMedication = async (req, res) => {
  try {
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.medicationId,
      req.body,
      { new: true }
    );
    if (!updatedMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }
    res.status(200).json(updatedMedication);
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({ message: "Failed to update medication" });
  }
};

// Delete a medication
exports.deleteMedication = async (req, res) => {
  try {
    const deletedMedication = await Medication.findByIdAndDelete(
      req.params.medicationId
    );
    if (!deletedMedication) {
      return res.status(404).json({ message: "Medication not found" });
    }
    res.status(200).json({ message: "Medication deleted" });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({ message: "Failed to delete medication" });
  }
};

// Toggle sharing of a medication
exports.toggleShareMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.medicationId);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }
    medication.isShared = !medication.isShared;
    await medication.save();
    res.status(200).json({
      message: "Medication sharing status updated",
      isShared: medication.isShared,
    });
  } catch (error) {
    console.error("Error updating medication sharing status:", error);
    res
      .status(500)
      .json({ message: "Failed to update sharing status for medication" });
  }
};
const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");
const protect = require("../middleware/authMiddleware");

router.post(
  "/api/medications",
  protect,
  medicationController.createMedication
);
router.get("/api/medications", protect, medicationController.getMedications);
router.get(
  "/api/medications/:medicationId",
  protect,
  medicationController.getMedicationById
);
router.put(
  "/api/medications/:medicationId",
  protect,
  medicationController.updateMedication
);
router.delete(
  "/api/medications/:medicationId",
  protect,
  medicationController.deleteMedication
);
router.patch(
  "/api/medications/:medicationId/share",
  protect,
  medicationController.toggleShareMedication
);

module.exports = router;
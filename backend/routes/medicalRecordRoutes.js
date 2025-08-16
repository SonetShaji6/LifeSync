const express = require("express");
const router = express.Router();
const medicalRecordController = require("../controllers/medicalRecordController");
const protect = require("../middleware/authMiddleware");
const { upload } = require("../controllers/medicalRecordController");
router.post(
"/api/medical-records",
protect,
upload.single("file"),
medicalRecordController.createMedicalRecord
);
router.get(
"/api/medical-records",
protect,
medicalRecordController.getMedicalRecords
);
router.get(
"/api/medical-records/:recordId",
protect,
medicalRecordController.getMedicalRecordById
);
router.put(
"/api/medical-records/:recordId",
protect,
medicalRecordController.updateMedicalRecord
);
router.delete(
"/api/medical-records/:recordId",
protect,
medicalRecordController.deleteMedicalRecord
);
router.patch(
"/api/medical-records/:recordId/share",
protect,
medicalRecordController.toggleShareMedicalRecord
);
router.get(
"/api/medical-records/:recordId/download",
protect,
medicalRecordController.downloadMedicalRecordFile
);

module.exports = router;
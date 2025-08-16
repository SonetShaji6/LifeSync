// routes/planRoutes.js
const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const protect = require("../middleware/authMiddleware");

router.post("/api/generate-plan", protect, planController.generatePlan);
router.get("/api/plans", protect, planController.listPlans); // Add this line for listing plans

module.exports = router;
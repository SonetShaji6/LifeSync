const express = require('express');
const router = express.Router();
const pinController = require('../controllers/pinController');
const protect = require('../middleware/authMiddleware'); // Your updated auth middleware

// Check PIN status
router.get('/api/user/pin-status', protect, pinController.checkPinStatus);

// Set PIN
router.post('/api/user/set-pin', protect, pinController.setPin);

// Verify PIN
router.post('/api/user/verify-pin', protect, pinController.verifyPin);

// Change PIN
router.post('/api/user/change-pin', protect, pinController.changePin);

module.exports = router;
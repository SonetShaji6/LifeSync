const bcrypt = require('bcryptjs');
const Pin = require('../models/Pin');

// Check if PIN is set for the user
exports.checkPinStatus = async (req, res) => {
  try {
    const pin = await Pin.findOne({ user: req.user._id });
    res.json({ isSet: !!pin });
  } catch (error) {
    console.error('Error checking PIN status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set PIN (only if not already set)
exports.setPin = async (req, res) => {
  try {
    const existingPin = await Pin.findOne({ user: req.user._id });
    if (existingPin) {
      return res.status(400).json({ message: 'PIN already set' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(req.body.pin, salt);

    const newPin = new Pin({
      user: req.user._id,
      hash: hashedPin,
    });
    await newPin.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error setting PIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify PIN
exports.verifyPin = async (req, res) => {
  try {
    const pin = await Pin.findOne({ user: req.user._id });
    if (!pin) {
      return res.status(400).json({ message: 'PIN not set' });
    }

    const isMatch = await bcrypt.compare(req.body.pin, pin.hash);
    res.json({ isValid: isMatch });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change PIN
exports.changePin = async (req, res) => {
  try {
    const pin = await Pin.findOne({ user: req.user._id });
    if (!pin) {
      return res.status(400).json({ message: 'PIN not set' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(req.body.pin, salt);

    pin.hash = hashedPin;
    await pin.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing PIN:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
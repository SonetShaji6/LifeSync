const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you still have a User model for authentication
    required: true,
    unique: true, // Ensure one PIN per user
  },
  hash: {
    type: String,
    required: true,
  },
});

const Pin = mongoose.model('Pin', pinSchema);

module.exports = Pin;
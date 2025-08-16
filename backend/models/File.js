const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who uploaded the file (for private storage)
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family', // Reference to the family (for family storage)
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
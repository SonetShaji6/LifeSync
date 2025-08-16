const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder', // Self-reference to another Folder (parent folder)
    default: null, // Root folder has no parent
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User who created the folder (for private storage)
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family', // Family to which the folder belongs (for family storage)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  path: {
    type: String,
    required: true
  }
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
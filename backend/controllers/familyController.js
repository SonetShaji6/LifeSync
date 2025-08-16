// lifesync-backend/controllers/familyController.js
const Family = require('../models/Family');
const User = require('../models/User');

// @desc    Get all families that the user is a member of
const getFamilies = async (req, res) => {
  try {
    const families = await Family.find({ members: req.user.id });
    res.status(200).json(families);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search for families by name
const searchFamilies = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const families = await Family.find({
      name: { $regex: searchQuery, $options: 'i' },
      members: { $ne: req.user.id }, // Exclude families the user is already in
    }).limit(10); // Limit search results (optional)

    res.status(200).json(families);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new family
const createFamily = async (req, res) => {
  try {
    const { name } = req.body;

    // Basic validation (you might have more in your validators.js)
    if (!name) {
      return res.status(400).json({ message: 'Family name is required' });
    }

    const newFamily = new Family({
      name,
      members: [req.user.id],
      admin: req.user.id,
    });

    const family = await newFamily.save();
    res.status(201).json(family);
  } catch (err) {
    console.error(err.message);

    // Handle duplicate key error (unique name constraint)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Family name already exists' });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Request to join a family
const requestToJoinFamily = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    const userId = req.user._id;

    // Check if user is already a member
    if (family.members.some(member => member._id.equals(userId))) {
      return res.status(400).json({ message: 'You are already a member of this family' });
    }

    // Check if a join request already exists
    const existingRequest = await Family.findOne({ _id: req.params.familyId, joinRequests: userId });
    console.log(existingRequest);
    if (existingRequest) {
      return res.status(200).json({ message: 'You already have a pending join request for this family' });
    }

    family.joinRequests.push(userId);
    await family.save();

    res.status(200).json({ message: 'Join request sent successfully'});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get family members
const getFamilyMembers = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId).populate(
      'members',
      'name email',
    );

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    res.status(200).json(family.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getJoinRequests = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId).populate('joinRequests', 'name email');

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.status(200).json(family.joinRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve a user's request to join the family
const approveJoinRequest = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    if (family.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only family admin can approve requests' });
    }

    const userId = req.params.userId;
    if (!family.joinRequests.includes(userId)) {
      return res
        .status(400)
        .json({ message: 'User has not requested to join this family' });
    }
    family.joinRequests.pull(userId);
    family.members.push(userId);

    await family.save();
    res.status(200).json({ message: 'Join request approved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove a user from the family
const removeFamilyMember = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    if (family.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only family admin can remove members' });
    }

    const userId = req.params.userId;
    if (!family.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member' });
    }

    family.members.pull(userId);

    await family.save();

    res.status(200).json({ message: 'Family member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getFamilies,
  searchFamilies,
  createFamily,
  requestToJoinFamily,
  getFamilyMembers,
  getJoinRequests,
  approveJoinRequest,
  removeFamilyMember,
};
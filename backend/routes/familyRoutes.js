// lifesync-backend/routes/familyRoutes.js
const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const protect = require('../middleware/authMiddleware');

router.use(protect); // Apply authentication middleware to all routes

// GET /api/families - Get families for the logged-in user
router.route('/').get(familyController.getFamilies).post(familyController.createFamily);

// GET /api/families/search?q= - Search for families
router.get('/search', familyController.searchFamilies);

// POST /api/families/:familyId/join - Request to join a family
router.post('/:familyId/join', familyController.requestToJoinFamily);

// GET /api/families/:familyId/members - Get family members with their names and emails
router.get('/:familyId/members', familyController.getFamilyMembers);

// GET /api/families/:familyId/joinRequests - Get join requests for a family (new route)
router.get('/:familyId/joinRequests', familyController.getJoinRequests); 

// PATCH /api/families/:familyId/approve/:userId - Approve a user's join request
router.patch('/:familyId/approve/:userId', familyController.approveJoinRequest);

// DELETE /api/families/:familyId/members/:userId - Remove a user from the family
router.delete('/:familyId/members/:userId', familyController.removeFamilyMember);

module.exports = router;
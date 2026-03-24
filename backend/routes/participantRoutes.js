// ====================================
// Participant Routes
// ====================================
// Maps URL paths to the participant controller functions.
// All routes require authentication.

const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { verifyToken } = require('../middleware/authMiddleware');

// All participant routes require login
router.use(verifyToken);

// Participant routes (nested under /api/events/:id/participants)
router.get('/:id/participants', participantController.getParticipants);        // GET    /api/events/:id/participants
router.post('/:id/participants', participantController.addParticipant);         // POST   /api/events/:id/participants
router.put('/:id/participants/:pid', participantController.updateParticipantStatus); // PUT /api/events/:id/participants/:pid
router.delete('/:id/participants/:pid', participantController.removeParticipant);   // DELETE /api/events/:id/participants/:pid

// User search (for invitation autocomplete)
router.get('/search/users', participantController.searchUsers);  // GET /api/events/search/users?email=...

module.exports = router;

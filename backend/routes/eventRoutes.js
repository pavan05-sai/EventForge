// ====================================
// Event Routes
// ====================================
// Maps URL paths to the event controller functions.
// All routes require authentication (verifyToken).

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken } = require('../middleware/authMiddleware');

// All event routes require login
router.use(verifyToken);

router.get('/', eventController.getEvents);           // GET    /api/events
router.post('/', eventController.createEvent);         // POST   /api/events
router.get('/:id', eventController.getEvent);          // GET    /api/events/:id
router.put('/:id', eventController.updateEvent);       // PUT    /api/events/:id
router.delete('/:id', eventController.deleteEvent);    // DELETE /api/events/:id

module.exports = router;

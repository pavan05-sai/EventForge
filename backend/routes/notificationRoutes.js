// ====================================
// Notification Routes
// ====================================
// Maps URL paths to the notification controller functions.

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// All notification routes require login
router.use(verifyToken);

router.get('/', notificationController.getNotifications);          // GET /api/notifications
router.put('/read-all', notificationController.markAllAsRead);     // PUT /api/notifications/read-all
router.put('/:id/read', notificationController.markAsRead);        // PUT /api/notifications/:id/read

module.exports = router;

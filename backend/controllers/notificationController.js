// ====================================
// Notification Controller
// ====================================
// Handles retrieving and managing user notifications.

const NotificationModel = require('../models/notificationModel');

// ---- GET all notifications for the logged-in user ----
// GET /api/notifications
async function getNotifications(req, res, next) {
    try {
        const userId = req.user.id;

        // Get notifications and unread count
        const notifications = await NotificationModel.findByUser(userId);
        const unreadCount = await NotificationModel.getUnreadCount(userId);

        res.json({ notifications, unread_count: unreadCount });
    } catch (error) {
        next(error);
    }
}

// ---- MARK a notification as read ----
// PUT /api/notifications/:id/read
async function markAsRead(req, res, next) {
    try {
        const notificationId = req.params.id;

        const notification = await NotificationModel.markAsRead(notificationId, req.user.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        res.json({
            message: 'Notification marked as read.',
            notification,
        });
    } catch (error) {
        next(error);
    }
}

// ---- MARK ALL notifications as read ----
// PUT /api/notifications/read-all
async function markAllAsRead(req, res, next) {
    try {
        const userId = req.user.id;

        await NotificationModel.markAllAsRead(userId);

        res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};

// ====================================
// Participant Controller
// ====================================
// Handles adding, removing, and updating event participants.

const ParticipantModel = require('../models/participantModel');
const EventModel = require('../models/eventModel');
const UserModel = require('../models/userModel');
const NotificationModel = require('../models/notificationModel');

// ---- GET all participants for an event ----
// GET /api/events/:id/participants
async function getParticipants(req, res, next) {
    try {
        const eventId = req.params.id;

        // Check if event exists
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        const isParticipant = await ParticipantModel.findByEventAndUser(eventId, req.user.id);
        if (event.created_by !== req.user.id && !isParticipant && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You do not have access to this event.' });
        }

        const participants = await ParticipantModel.findByEvent(eventId);

        res.json({ participants });
    } catch (error) {
        next(error);
    }
}

// ---- INVITE a participant to an event ----
// POST /api/events/:id/participants
// Body: { email: "user@example.com" }
async function addParticipant(req, res, next) {
    try {
        const eventId = req.params.id;
        const { email } = req.body;
        const inviterId = req.user.id;

        // --- Validation ---
        if (!email) {
            return res.status(400).json({ error: 'Please provide the participant email.' });
        }

        // Check if event exists and the inviter owns it
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        if (event.created_by !== inviterId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only the event creator can invite participants.' });
        }

        // Find the user to invite
        const userToInvite = await UserModel.findByEmail(email.toLowerCase().trim());
        if (!userToInvite) {
            return res.status(404).json({ error: 'No user found with that email.' });
        }

        // Can't invite yourself
        if (userToInvite.id === inviterId) {
            return res.status(400).json({ error: 'You cannot invite yourself to your own event.' });
        }

        // Check if already invited
        const existing = await ParticipantModel.findByEventAndUser(eventId, userToInvite.id);
        if (existing) {
            return res.status(409).json({ error: 'This user is already invited to this event.' });
        }

        // Create the participant record
        const participant = await ParticipantModel.create({
            event_id: eventId,
            user_id: userToInvite.id,
            status: 'invited',
        });

        // Send a notification to the invited user
        await NotificationModel.create({
            user_id: userToInvite.id,
            event_id: eventId,
            message: `You've been invited to "${event.title}" on ${event.date}.`,
        });

        res.status(201).json({
            message: 'Participant invited successfully!',
            participant,
        });
    } catch (error) {
        next(error);
    }
}

// ---- UPDATE participant status (accept/decline) ----
// PUT /api/events/:id/participants/:pid
// Body: { status: "accepted" } or { status: "declined" }
async function updateParticipantStatus(req, res, next) {
    try {
        const { id: eventId, pid } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Validate status
        if (!status || !['accepted', 'declined'].includes(status)) {
            return res.status(400).json({
                error: 'Status must be "accepted" or "declined".',
            });
        }

        // Check if event exists
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // Only the invited user can accept/decline
        const participant = await ParticipantModel.findByEventAndUser(eventId, userId);
        if (!participant || participant.id !== pid) {
            return res.status(403).json({
                error: 'You can only update your own participation status.',
            });
        }

        const updated = await ParticipantModel.updateStatus(pid, status);

        // Notify the event creator
        await NotificationModel.create({
            user_id: event.created_by,
            event_id: eventId,
            message: `${req.user.full_name} has ${status} your event "${event.title}".`,
        });

        res.json({
            message: `You have ${status} the invitation.`,
            participant: updated,
        });
    } catch (error) {
        next(error);
    }
}

// ---- REMOVE a participant from an event ----
// DELETE /api/events/:id/participants/:pid
async function removeParticipant(req, res, next) {
    try {
        const { id: eventId, pid } = req.params;
        const userId = req.user.id;

        // Check if event exists
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // Only the event creator can remove participants
        if (event.created_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Only the event creator can remove participants.',
            });
        }

        await ParticipantModel.remove(eventId, pid);

        res.json({ message: 'Participant removed successfully.' });
    } catch (error) {
        next(error);
    }
}

// ---- SEARCH users for invitation ----
// GET /api/users/search?email=john
async function searchUsers(req, res, next) {
    try {
        const { email } = req.query;

        if (!email || email.length < 2) {
            return res.status(400).json({ error: 'Please enter at least 2 characters to search.' });
        }

        const users = await UserModel.searchByEmail(email);
        res.json({ users });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getParticipants,
    addParticipant,
    updateParticipantStatus,
    removeParticipant,
    searchUsers,
};

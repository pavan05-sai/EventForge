// ====================================
// Event Controller
// ====================================
// Handles creating, reading, updating, and deleting events.
// Also includes scheduling conflict detection.

const EventModel = require('../models/eventModel');
const ParticipantModel = require('../models/participantModel');
const NotificationModel = require('../models/notificationModel');

// ---- GET all events for the logged-in user ----
// GET /api/events
// Supports query params: ?status=upcoming&from_date=2025-01-01&to_date=2025-12-31
async function getEvents(req, res, next) {
    try {
        const userId = req.user.id;

        // Build filters from query parameters
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.date) filters.date = req.query.date;
        if (req.query.from_date) filters.from_date = req.query.from_date;
        if (req.query.to_date) filters.to_date = req.query.to_date;

        // Get events the user created
        const ownEvents = await EventModel.findByUser(userId, filters);

        // Get events where user is a participant
        const participantEvents = await EventModel.findByParticipant(userId);

        res.json({
            own_events: ownEvents,
            participating_events: participantEvents,
        });
    } catch (error) {
        next(error);
    }
}

// ---- GET a single event by ID ----
// GET /api/events/:id
async function getEvent(req, res, next) {
    try {
        const event = await EventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        const isParticipant = await ParticipantModel.findByEventAndUser(event.id, req.user.id);
        if (event.created_by !== req.user.id && !isParticipant && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You do not have access to this event.' });
        }

        res.json({ event });
    } catch (error) {
        next(error);
    }
}

// ---- CREATE a new event ----
// POST /api/events
async function createEvent(req, res, next) {
    try {
        const { title, description, date, start_time, end_time, location } = req.body;
        const userId = req.user.id;

        // --- Input Validation ---
        if (!title || !date || !start_time || !end_time) {
            return res.status(400).json({
                error: 'Title, date, start time, and end time are required.',
            });
        }

        // Check that end_time is after start_time
        if (end_time <= start_time) {
            return res.status(400).json({
                error: 'End time must be after start time.',
            });
        }

        // --- Check for scheduling conflicts ---
        const conflicts = await EventModel.checkConflict(userId, date, start_time, end_time);
        if (conflicts.length > 0) {
            return res.status(409).json({
                error: 'Scheduling conflict! You already have an event at this time.',
                conflicts: conflicts.map(c => ({
                    title: c.title,
                    time: `${c.start_time} - ${c.end_time}`,
                })),
            });
        }

        // --- Create the event ---
        const event = await EventModel.create({
            title: title.trim(),
            description: description ? description.trim() : null,
            date,
            start_time,
            end_time,
            location: location ? location.trim() : null,
            created_by: userId,
            status: 'upcoming',
        });

        res.status(201).json({
            message: 'Event created successfully!',
            event,
        });
    } catch (error) {
        next(error);
    }
}

// ---- UPDATE an existing event ----
// PUT /api/events/:id
async function updateEvent(req, res, next) {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists and belongs to the user
        const existingEvent = await EventModel.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        if (existingEvent.created_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only edit your own events.' });
        }

        const { title, description, date, start_time, end_time, location, status } = req.body;

        // If date/time changed, check for conflicts
        if (date && start_time && end_time) {
            if (end_time <= start_time) {
                return res.status(400).json({
                    error: 'End time must be after start time.',
                });
            }

            const conflicts = await EventModel.checkConflict(
                existingEvent.created_by,
                date,
                start_time,
                end_time,
                eventId // Exclude current event from conflict check
            );
            if (conflicts.length > 0) {
                return res.status(409).json({
                    error: 'Scheduling conflict with another event.',
                    conflicts: conflicts.map(c => ({
                        title: c.title,
                        time: `${c.start_time} - ${c.end_time}`,
                    })),
                });
            }
        }

        // Build update object (only include provided fields)
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (date) updateData.date = date;
        if (start_time) updateData.start_time = start_time;
        if (end_time) updateData.end_time = end_time;
        if (location !== undefined) updateData.location = location;
        if (status) updateData.status = status;

        const updatedEvent = await EventModel.update(eventId, updateData);

        res.json({
            message: 'Event updated successfully!',
            event: updatedEvent,
        });
    } catch (error) {
        next(error);
    }
}

// ---- DELETE an event ----
// DELETE /api/events/:id
async function deleteEvent(req, res, next) {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists and belongs to the user
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        if (event.created_by !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own events.' });
        }

        await EventModel.remove(eventId);

        res.json({ message: 'Event deleted successfully!' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
};

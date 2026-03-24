// ====================================
// Server Entry Point
// ====================================
// This is the main file that starts the Express server.
// It sets up middleware, routes, and starts listening for requests.

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const participantRoutes = require('./routes/participantRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { verifyToken, requireAdmin } = require('./middleware/authMiddleware');

// Import models for admin routes
const UserModel = require('./models/userModel');
const EventModel = require('./models/eventModel');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ====================================
// Middleware Setup
// ====================================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the frontend to make requests to the backend
app.use(cors());

// Parse JSON request bodies
// This lets us access req.body in our route handlers
app.use(express.json());

// Serve static files from the "public" folder
// This serves our HTML, CSS, and JS files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ====================================
// API Routes
// ====================================

// Mount route modules at their base paths
app.use('/api/auth', authRoutes);               // Authentication routes
app.use('/api/events', participantRoutes);       // Participant routes (must come before event routes for /search/users)
app.use('/api/events', eventRoutes);             // Event CRUD routes
app.use('/api/notifications', notificationRoutes); // Notification routes

// ---- Admin Routes ----
// GET /api/admin/users - Get all users (admin only)
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const users = await UserModel.findAll();
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/events - Get all events (admin only)
app.get('/api/admin/events', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const events = await EventModel.findAll();
        res.json({ events });
    } catch (error) {
        next(error);
    }
});

// ====================================
// Serve Frontend Pages
// ====================================
// For any route that doesn't match an API endpoint,
// serve the corresponding HTML file or fall back to index.html

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'event.html'));
});

app.get('/event-detail', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'event-detail.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin.html'));
});

// ====================================
// Error Handling
// ====================================

// Global error handler (must be last middleware)
app.use(errorHandler);

// ====================================
// Start the Server
// ====================================
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀  Server running on port ${PORT}`);
    console.log(`🚀  http://localhost:${PORT}`);
    console.log('🚀 ================================');
    console.log('');
});

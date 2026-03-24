// ====================================
// Authentication Middleware
// ====================================
// This middleware checks if the request has a valid JWT token.
// It protects routes that require the user to be logged in.

const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// ---- Verify JWT Token ----
// Checks the Authorization header for a Bearer token
async function verifyToken(req, res, next) {
    try {
        // Get the token from the Authorization header
        // Format: "Bearer eyJhbGciOi..."
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. No token provided.',
            });
        }

        // Extract the token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        // Verify the token using our JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the full user from the database
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid token. User not found.',
            });
        }

        // Attach the user to the request object
        // Now all route handlers can access req.user
        req.user = user;
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(500).json({ error: 'Authentication error.' });
    }
}

// ---- Check if user is an Admin ----
// Must be used AFTER verifyToken middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.',
        });
    }
    next();
}

module.exports = {
    verifyToken,
    requireAdmin,
};

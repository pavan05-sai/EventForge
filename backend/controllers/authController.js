// ====================================
// Auth Controller
// ====================================
// Handles user registration, login, and profile retrieval.
// Uses bcrypt for password hashing and JWT for token generation.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// ---- REGISTER a new user ----
// POST /api/auth/register
async function register(req, res, next) {
    try {
        const { email, password, full_name } = req.body;

        // --- Input Validation ---
        if (!email || !password || !full_name) {
            return res.status(400).json({
                error: 'Please provide email, password, and full name.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long.',
            });
        }

        // --- Check if user already exists ---
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                error: 'An account with this email already exists.',
            });
        }

        // --- Hash the password ---
        // bcrypt adds a "salt" (random data) to make the hash unique
        // The number 10 is the "salt rounds" (higher = more secure but slower)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- Create the user in the database ---
        const newUser = await UserModel.create({
            email: email.toLowerCase().trim(),
            password_hash,
            full_name: full_name.trim(),
            role: 'user', // New users are always regular users
        });

        // --- Generate JWT token ---
        const token = jwt.sign(
            { userId: newUser.id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        // --- Send response (exclude password_hash) ---
        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role,
            },
        });
    } catch (error) {
        next(error); // Pass error to the global error handler
    }
}

// ---- LOGIN an existing user ----
// POST /api/auth/login
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        // --- Input Validation ---
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password.',
            });
        }

        // --- Find user by email ---
        const user = await UserModel.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password.',
            });
        }

        // --- Compare password with stored hash ---
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password.',
            });
        }

        // --- Generate JWT token ---
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // --- Send response ---
        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

// ---- GET current user profile ----
// GET /api/auth/me
async function getProfile(req, res, next) {
    try {
        // req.user is set by the authMiddleware
        res.json({ user: req.user });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getProfile,
};

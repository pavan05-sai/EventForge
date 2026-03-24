// ====================================
// Auth Routes
// ====================================
// Maps URL paths to the auth controller functions.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes (no login required)
router.post('/register', authController.register);  // POST /api/auth/register
router.post('/login', authController.login);          // POST /api/auth/login

// Protected routes (login required)
router.get('/me', verifyToken, authController.getProfile);  // GET /api/auth/me

module.exports = router;

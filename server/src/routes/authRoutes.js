// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/auth');
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateJWT, authController.getCurrentUser);
// Protected routes
router.post('/logout', authenticateJWT, authController.logout);
router.get('/profile', authenticateJWT, authController.getProfile);




module.exports = router;
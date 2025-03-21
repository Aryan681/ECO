// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateJWT } = require('../middlewares/auth');
const upload = require('../config/multerConfig'); // Import Multer configuration

// Profile CRUD routes
router.get('/', authenticateJWT, profileController.getProfile); // Get profile
router.put('/', authenticateJWT, profileController.updateProfile); // Update profile (excluding image)
router.delete('/', authenticateJWT, profileController.deleteProfile); // Delete profile

// Image upload routes
router.post('/upload-image', authenticateJWT, upload.single('profileImage'), profileController.uploadProfileImage); // Upload profile image
router.delete('/delete-image', authenticateJWT, profileController.deleteProfileImage); // Delete profile image

module.exports = router;
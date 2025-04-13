// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/auth');
const upload = require('../config/multerConfig'); // Import Multer configuration

// Profile CRUD routes
router.get('/', authenticate, profileController.getProfile); // Get profile
router.put('/', authenticate, profileController.updateProfile); // Update profile (excluding image)
router.delete('/', authenticate, profileController.deleteProfile); // Delete profile

// Image upload routes
router.post('/upload-image', authenticate, upload.single('profileImage'), profileController.uploadProfileImage); // Upload profile image
router.delete('/delete-image', authenticate, profileController.deleteProfileImage); // Delete profile image

module.exports = router;
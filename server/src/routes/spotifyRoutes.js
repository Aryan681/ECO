const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const { authenticate } = require('../middlewares/auth');

// Start Spotify OAuth flow
router.get('/login', authenticate, spotifyController.initiateSpotifyLogin);

// Callback from Spotify after auth
router.get('/callback', authenticate, spotifyController.handleSpotifyCallback);

// Get current user's Spotify profile
router.get('/profile', authenticate, spotifyController.getSpotifyProfile);

module.exports = router;

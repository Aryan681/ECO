const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const { authenticate ,requireSpotifyConnection} = require('../middlewares/auth');

router.get('/login', authenticate, spotifyController.initiateSpotifyLogin);
router.get('/callback', spotifyController.handleSpotifyCallback);

router.get('/profile', authenticate, requireSpotifyConnection, spotifyController.getSpotifyProfile);

router.get('/playlists', authenticate, requireSpotifyConnection, spotifyController.getUserPlaylists);
router.get('/liked', authenticate, requireSpotifyConnection, spotifyController.getLikedSongs);


router.post('/play', authenticate, requireSpotifyConnection, spotifyController.playTrack);
router.put('/pause', authenticate, requireSpotifyConnection, spotifyController.pauseTrack);
router.put('/resume', authenticate, requireSpotifyConnection, spotifyController.resumeTrack);

router.post('/track', authenticate, spotifyController.skipTrack);

router.post('/like', authenticate, requireSpotifyConnection,spotifyController.likeTrack);
router.post('/playlist/add', authenticate, requireSpotifyConnection,spotifyController.addTrackToPlaylist);

router.post('/unlike', authenticate, requireSpotifyConnection,spotifyController.unlikeTrack);
router.post('/playlist/remove', authenticate, requireSpotifyConnection,spotifyController.removeTrackFromPlaylist);

router.get('/playlists/:playlistId/tracks', 
    authenticate, 
    requireSpotifyConnection, 
    spotifyController.getPlaylistTracks
  );
module.exports = router;
  
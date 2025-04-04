const spotifyService = require('../services/spotifyService');

exports.initiateSpotifyLogin = (req, res) => {
  const url = spotifyService.getAuthorizationUrl(req.user.id);
  return res.redirect(url);
};

exports.handleSpotifyCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state || req.user?.id;

    if (!code || !userId) {
      return res.status(400).json({ success: false, message: 'Missing code or user' });
    }

    console.log('📥 Received code:', code);
    console.log('👤 Received userId from state:', userId);

    await spotifyService.exchangeTokenAndSaveUser(code, userId);
    return res.status(200).json({
      success: true,
      message: 'Spotify account connected successfully',
      userId
    });
  } catch (error) {
    console.error("❌ Spotify Callback Error:", error.response?.data || error.message || error);
    res.status(500).json({ success: false, message: 'Failed to connect Spotify' });
  }
};

exports.getSpotifyProfile = async (req, res) => {
  try {
    const profile = await spotifyService.fetchSpotifyProfile(req.user.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error("❌ Get Spotify Profile Error:", error.response?.data || error.message || error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

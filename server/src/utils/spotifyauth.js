// utils/spotifyauth.js
const axios = require('axios');
const qs = require('qs');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

exports.refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
};

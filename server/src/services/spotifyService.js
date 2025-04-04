const axios = require('axios');
const qs = require('qs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const SCOPES = [
  'user-read-email',
  'user-read-private'
].join(' ');

// Generate the Spotify authorization URL
exports.getAuthorizationUrl = (userId) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: userId
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Exchange the auth code for access & refresh tokens, then upsert user data
exports.exchangeTokenAndSaveUser = async (code, userId) => {
  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    const userInfoRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const data = userInfoRes.data;

    const spotifyData = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000),
      spotifyId: data.id,
      displayName: data.display_name,
      email: data.email,
      country: data.country,
      product: data.product,
      avatarUrl: data.images?.[0]?.url || null,
      scope: SCOPES  // ✅ save scope explicitly (if your model expects it)
    };

    await prisma.spotifyAccount.upsert({
      where: { userId },
      update: spotifyData,
      create: { userId, ...spotifyData }
    });

  } catch (error) {
    console.error('Error exchanging token and saving user:', error.response?.data || error.message);
    throw new Error('Spotify authorization failed');
  }
};

// Fetch the connected Spotify profile using stored access token
exports.fetchSpotifyProfile = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({
    where: { userId }
  });

  if (!account) throw new Error("Spotify not connected");

  const res = await axios.get('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    }
  });

  return res.data;
};

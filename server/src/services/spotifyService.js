const axios = require('axios');
const qs = require('qs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const SCOPES = [
  // 🔓 User identity
  'user-read-email',
  'user-read-private',

  // 🎧 Playback control
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',

  // ❤️ Liked (saved) songs
  'user-library-read',
  'user-library-modify',

  // 📂 Playlists - read/write
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',

  // 🕒 Recent history
  'user-read-recently-played',

  // 📊 Top tracks/artists
  'user-top-read'
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
    headers: { Authorization: `Bearer ${access_token}` }
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
    scope: SCOPES
  };

  await prisma.spotifyAccount.upsert({
    where: { userId },
    update: spotifyData,
    create: { userId, ...spotifyData }
  });

  return data.id;
};

// Play track (accepts optional track URI)
exports.playTrack = async (userId, trackUri) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.put('https://api.spotify.com/v1/me/player/play', 
    trackUri ? { uris: [trackUri] } : {}, 
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`
      }
    }
  );
};

// Pause current playback
exports.pauseTrack = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    }
  });
};

// Resume playback (alias of playTrack without URI)
exports.resumeTrack = async (userId) => {
  return exports.playTrack(userId);
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

exports.fetchUserPlaylists = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({
    where: { userId }
  });

  if (!account) throw new Error("Spotify not connected");

  const res = await axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    }
  });

  return res.data; 
};

exports.fetchLikedSongs = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({
    where: { userId }
  });

  if (!account) throw new Error("Spotify not connected");

  const res = await axios.get('https://api.spotify.com/v1/me/tracks', {
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    }
  });

  return res.data; 
}


// Skip to next track
exports.nextTrack = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.post(
    'https://api.spotify.com/v1/me/player/next',
    {},
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    }
  );
};

// Skip to previous track
exports.previousTrack = async (userId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.post(
    'https://api.spotify.com/v1/me/player/previous',
    {},
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    }
  );
};

// Add to Liked Songs
exports.likeTrack = async (userId, trackId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.put(`https://api.spotify.com/v1/me/tracks`, 
    { ids: [trackId] }, 
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`
      }
    }
  );
};

// Add to Playlist
exports.addTrackToPlaylist = async (userId, playlistId, trackUri) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    { uris: [trackUri] },
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`
      }
    }
  );
};


// Unlike a Track
exports.unlikeTrack = async (userId, trackId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.delete(`https://api.spotify.com/v1/me/tracks`, {
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    },
    data: {
      ids: [trackId]
    }
  });
};

// Remove Track from Playlist
exports.removeTrackFromPlaylist = async (userId, playlistId, trackUri) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  await axios.request({
    method: 'delete',
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: {
      Authorization: `Bearer ${account.accessToken}`
    },
    data: {
      tracks: [{ uri: trackUri }]
    }
  });
};


exports.isTrackLiked = async (userId, trackId) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Spotify not connected");

  const res = await axios.get(
    `https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`
      }
    }
  );

  return res.data[0]; // true or false
};

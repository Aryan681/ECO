const axios = require('axios');
const qs = require('qs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { callSpotifyApi } = require('../utils/spotifyApiClient'); // use your correct path

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


// All API methods use callSpotifyApi now:

exports.playTrack = async (userId, trackUri) =>
  await callSpotifyApi(userId, async (token) =>
    axios.put('https://api.spotify.com/v1/me/player/play', trackUri ? { uris: [trackUri] } : {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.pauseTrack = async (userId) =>
  await callSpotifyApi(userId, async (token) =>
    axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.resumeTrack = async (userId) => exports.playTrack(userId);

exports.fetchSpotifyProfile = async (userId) =>
  await callSpotifyApi(userId, async (token) => {
    const res = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  });

exports.fetchUserPlaylists = async (userId) =>
  await callSpotifyApi(userId, async (token) => {
    const res = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  });

  exports.fetchLikedSongs = async (userId) => {
    return await callSpotifyApi(userId, async (token) => {
      let allTracks = [];
      let limit = 50;
      let offset = 0;
      let hasNext = true;
  
      while (hasNext) {
        const res = await axios.get('https://api.spotify.com/v1/me/tracks', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit, offset }
        });
  
        const data = res.data;
        allTracks = allTracks.concat(data.items);
  
        offset += limit;
        hasNext = data.next !== null;
      }
  
      return { items: allTracks };
    });
  };
  

exports.nextTrack = async (userId) =>
  await callSpotifyApi(userId, async (token) =>
    axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.previousTrack = async (userId) =>
  await callSpotifyApi(userId, async (token) =>
    axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.likeTrack = async (userId, trackId) =>
  await callSpotifyApi(userId, async (token) =>
    axios.put('https://api.spotify.com/v1/me/tracks', { ids: [trackId] }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.unlikeTrack = async (userId, trackId) =>
  await callSpotifyApi(userId, async (token) =>
    axios.delete('https://api.spotify.com/v1/me/tracks', {
      headers: { Authorization: `Bearer ${token}` },
      data: { ids: [trackId] }
    })
  );

exports.addTrackToPlaylist = async (userId, playlistId, trackUri) =>
  await callSpotifyApi(userId, async (token) =>
    axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { uris: [trackUri] }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );

exports.removeTrackFromPlaylist = async (userId, playlistId, trackUri) =>
  await callSpotifyApi(userId, async (token) =>
    axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { tracks: [{ uri: trackUri }] }
    })
  );

exports.isTrackLiked = async (userId, trackId) =>
  await callSpotifyApi(userId, async (token) => {
    const res = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data[0]; // true or false
  });

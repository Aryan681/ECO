// utils/spotifyApiClient.js
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { refreshAccessToken } = require('./spotifyauth');
 
exports.callSpotifyApi = async (userId, configFn) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error('Spotify account not found');

  let accessToken = account.accessToken;

  // Check if token has expired
  if (new Date() >= new Date(account.expiresAt)) {
    console.log("Access token expired. Refreshing...");
    const refreshed = await refreshAccessToken(account.refreshToken);

    accessToken = refreshed.access_token;

    await prisma.spotifyAccount.update({
      where: { userId },
      data: {
        accessToken: refreshed.access_token,
        expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
        refreshToken: refreshed.refresh_token || account.refreshToken,
      },
    });
  }

  // Call the API
  try {
    return await configFn(accessToken);
  } catch (error) {
    console.error("Spotify API Error:", error.response?.data || error.message);
    throw error;
  }
};

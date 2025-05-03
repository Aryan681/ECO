const axios = require('axios');
const { refreshAccessToken } = require('./spotifyauth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.callSpotifyApi = async (userId, configFn) => {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!account) throw new Error('Spotify account not found');

  let accessToken = account.accessToken;

  try {
    return await configFn(accessToken);
  } catch (err) {
    if (err.response?.status === 401 && account.refreshToken) {
      const newTokenData = await refreshAccessToken(account.refreshToken);

      const updatedAccount = await prisma.spotifyAccount.update({
        where: { userId },
        data: {
          accessToken: newTokenData.access_token,
          expiresAt: new Date(Date.now() + newTokenData.expires_in * 1000)
        }
      });

      accessToken = updatedAccount.accessToken;

      return await configFn(accessToken);
    } else {
      throw err;
    }
  }
};

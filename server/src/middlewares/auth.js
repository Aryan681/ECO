const { jwtVerify } = require('jose');
const { createSecretKey } = require('crypto');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require("axios");
const admin = require("firebase-admin");

const accessTokenSecret = createSecretKey(Buffer.from(process.env.JWT_ACCESS_SECRET || 'default_access_secret', 'utf-8'));

/**
 * Main authentication middleware that handles JWT, GitHub, and Firebase Google tokens.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // If token appears to be a GitHub token (e.g., starts with gho_):
    if (token.startsWith('gho_')) {
      return await authenticateGitHubToken(token, req, res, next);
    }
    
 

    // Otherwise, assume JWT (local)
    return await authenticateJWT(token, req, res, next);
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Handles JWT token authentication.
 */
const authenticateJWT = async (token, req, res, next) => {
  const { payload } = await jwtVerify(token, accessTokenSecret);
  req.user = { 
    id: payload.userId,
    authMethod: payload.authMethod
  };
  next();
};



/**
 * Handles GitHub token authentication.
 */
const authenticateGitHubToken = async (token, req, res, next) => {
  try {
    const githubResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    const user = await prisma.user.findFirst({
      where: {
        githubAccessToken: token,
        githubId: githubResponse.data.id.toString()
      },
      select: { id: true, authMethod: true, email: true }
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'GitHub account not linked to any user',
        action: 'Complete GitHub OAuth setup first'
      });
    }
    req.user = {
      id: user.id,
      authMethod: 'github',
      email: user.email 
    };
    next();
  } catch (error) {
    console.error('GitHub token verification failed:', error);
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'GitHub token expired or revoked',
        action: 'Reauthenticate with GitHub'
      });
    }
    next(error);
  }
};

/**
 * Checks authentication method for login attempts.
 */
const checkAuthMethod = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    if (user.authMethod === 'github') {
      return res.status(403).json({
        success: false,
        message: 'This account uses GitHub login',
        authMethod: 'github'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Ensures Spotify connection before using Spotify features.
 */
const requireSpotifyConnection = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  const spotifyAccount = await prisma.spotifyAccount.findUnique({ where: { userId } });
  if (!spotifyAccount) {
    return res.status(403).json({
      success: false,
      message: 'Spotify account not connected'
    });
  }
  req.spotifyAccount = spotifyAccount;
  next();
};


module.exports = {
  authenticate,
  authenticateJWT,

  checkAuthMethod,
  requireSpotifyConnection
};

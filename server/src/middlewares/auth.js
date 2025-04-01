// middleware/auth.js
const { jwtVerify } = require('jose');
const { createSecretKey } = require('crypto');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require("axios");

const accessTokenSecret = createSecretKey(Buffer.from(process.env.JWT_ACCESS_SECRET || 'default_access_secret', 'utf-8'));

/**
 * Main authentication middleware that handles both JWT and GitHub tokens
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
    // Check if it's a GitHub token (starts with gho_)
    if (token.startsWith('gho_')) {
      return await authenticateGitHubToken(token, req, res, next);
    }
    
    // Otherwise treat as JWT
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
 * Handles JWT token authentication
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
 * Handles GitHub token authentication
 */
const authenticateGitHubToken = async (token, req, res, next) => {
  try {
    // 1. Verify token with GitHub API
    const githubResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // 2. Find user in database using correct field names
    const user = await prisma.user.findFirst({
      where: {
        githubAccessToken: token,
        githubId: githubResponse.data.id.toString()
      },
      select: {
        id: true,
        authMethod: true, // Changed from authProvider to match schema
        email: true
      }
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
      authMethod: user.authMethod // Updated field name
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
 * Checks authentication method for login attempts
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

    // Block password login for GitHub-authenticated users
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

module.exports = {
  authenticate, // Main authentication middleware
  authenticateJWT, // For specific JWT cases
  checkAuthMethod
};
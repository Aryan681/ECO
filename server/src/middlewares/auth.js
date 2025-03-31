// middleware/auth.js
const { jwtVerify } = require('jose');
const { createSecretKey } = require('crypto');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  // Verify the token exists in our system and is valid
  const user = await prisma.user.findFirst({
    where: {
      githubAccessToken: token
    },
    select: {
      id: true,
      authProvider: true
    }
  });

  if (!user) {
    throw new Error('Invalid GitHub access token');
  }

  req.user = {
    id: user.id,
    authMethod: user.authProvider
  };
  next();
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
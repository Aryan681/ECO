// controllers/authController.js
const authService = require('../services/authService');
const { validateLoginData, validateRegisterData } = require('../utils/datavalidator');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cookie configuration (shared for all auth routes)
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'Strict', // Prevent CSRF attacks
  domain: process.env.COOKIE_DOMAIN || 'localhost',
};

const register = async (req, res, next) => {
  try {
    const validationResult = validateRegisterData(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { email, password, name } = validationResult.data;
    const existingUser = await authService.findUserByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const user = await authService.createUser({ email, password, name });
    const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
    
    // Set cookies
    res.cookie('accessToken', accessToken, {
      ...cookieConfig,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validationResult = validateLoginData(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { email, password } = validationResult.data;
    const user = await authService.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    if (user.authProvider === 'github') {
      return res.status(403).json({
        success: false,
        message: 'Please sign in with GitHub',
        authProvider: ['github']
      });
    }
    
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
    
    // Set cookies
    res.cookie('accessToken', accessToken, {
      ...cookieConfig,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const tokens = await authService.refreshAuthTokens(refreshToken);
    
    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Set new cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieConfig,
      maxAge: 15 * 60 * 1000
    });
    
    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully'
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    await authService.invalidateRefreshToken(refreshToken);
    
    // Clear cookies
    res.clearCookie('accessToken', cookieConfig);
    res.clearCookie('refreshToken', cookieConfig);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Helper function to format user response
const formatUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
  profile: user.profile ? {
    id: user.profile.id,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    bio: user.profile.bio,
    avatarUrl: user.profile.avatarUrl
  } : null
});

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log("Fetching profile for user:", userId); // Debugging log

    // Fetch user along with profile & projects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            githubUrl: true
          }
        }
      }
    });

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure profile exists
    const profile = user.profile
      ? {
          id: user.profile.id,
          firstName: user.profile.firstName || '',
          lastName: user.profile.lastName || '',
          bio: user.profile.bio || '',
          profileImage: user.profile.profileImage || '',
        }
      : null;

    // Return formatted response
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          profile,
          projects: user.projects,
          githubConnected: !!user.githubAccessToken
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    // The authenticateJWT middleware already verified the token and attached the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  getCurrentUser
};
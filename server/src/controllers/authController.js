// controllers/authController.js
const authService = require('../services/authService');
const { validateLoginData, validateRegisterData } = require('../utils/datavalidator');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    // Validate request data
    const validationResult = validateRegisterData(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { email, password, name } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = await authService.createUser({ email, password, name });
    
    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
    
    // Format user data for response
    const userData = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        bio: user.profile.bio
      } : null
    };
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // Validate request data
    const validationResult = validateLoginData(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { email, password } = validationResult.data;
    
    // Authenticate user
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateAuthTokens(user);
    
    // Format user data for response
    const userData = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        bio: user.profile.bio
      } : null
    };
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token and generate new tokens
    const tokens = await authService.refreshAuthTokens(refreshToken);
    
    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Return new tokens
    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Invalidate the refresh token
    await authService.invalidateRefreshToken(refreshToken);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

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


module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
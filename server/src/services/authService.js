// services/authService.js
const argon2 = require('argon2');
const { createSecretKey } = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL);

// JWT configuration
const accessTokenSecret = createSecretKey(Buffer.from(process.env.JWT_ACCESS_SECRET || 'default_access_secret', 'utf-8'));
const refreshTokenSecret = createSecretKey(Buffer.from(process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', 'utf-8'));
const accessTokenExpiration = process.env.JWT_ACCESS_EXPIRATION || '15m';
const refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

// Hash password using argon2
const hashPassword = async (password) => {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  } catch (error) {
    logger.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error) {
    logger.error('Password verification error:', error);
    throw new Error('Failed to verify password');
  }
};

// Find user by email
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      profile: true
    }
  });
};

// Create new user
const createUser = async ({ email, password, name }) => {
  const hashedPassword = await hashPassword(password);
  
  // Use a transaction to create both user and profile
  return prisma.$transaction(async (tx) => {
    // Create the user first
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    });
    
    // Create a related profile if name is provided
    if (name) {
      // Split name into first and last name if possible
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      
      await tx.profile.create({
        data: {
          firstName,
          lastName,
          userId: user.id
        }
      });
    }
    
    // Return user with profile
    return tx.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });
  });
};

// Generate JWT tokens
const generateAuthTokens = async (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    { expiresIn: accessTokenExpiration }
  );
  
  
  // Generate refresh token with a unique identifier
  const jti = uuidv4();
  const refreshToken = await new SignJWT({ userId: user.id, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(refreshTokenExpiration)
    .sign(refreshTokenSecret);
  
  // Store refresh token in Redis with expiration time
  const refreshExpSeconds = Math.floor(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime() / 1000);
  await redis.set(`refresh_token:${jti}`, user.id, 'EX', refreshExpSeconds);
  
  return { accessToken, refreshToken };
};

// Refresh authentication tokens
const refreshAuthTokens = async (refreshToken) => {
  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');

    const { userId, jti } = payload;
    
    // Check if token is in Redis (not revoked)
    const storedUserId = await redis.get(`refresh_token:${jti}`);
    if (!storedUserId || storedUserId !== userId) {
      return null;
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    if (!user) {
      return null;
    }
    
    // Revoke the current refresh token
    await redis.del(`refresh_token:${jti}`);
    
    // Generate new tokens
    return generateAuthTokens(user);
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    return null;
  }
};

// Invalidate refresh token
const invalidateRefreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, refreshTokenSecret);
    const { jti } = payload;
    
    // Remove token from Redis
    await redis.del(`refresh_token:${jti}`);
    
    return true;
  } catch (error) {
    logger.error('Invalidate refresh token error:', error);
    return false;
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  verifyPassword,
  generateAuthTokens,
  refreshAuthTokens,
  invalidateRefreshToken,
  hashPassword
};
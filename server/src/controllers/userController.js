const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redis = require('redis');
const logger = require('../utils/logger');

// Initialize Redis client
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Get user by ID
const getUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check Redis cache first
    const cachedUser = await redisClient.get(`user:${id}`);
    if (cachedUser) {
      logger.info(`User ${id} fetched from cache`);
      return res.status(200).json(JSON.parse(cachedUser));
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cache the user data in Redis
    await redisClient.set(`user:${id}`, JSON.stringify(user), {
      EX: 3600, // Cache for 1 hour
    });

    logger.info(`User ${id} fetched from database`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Get user error: ${error}`);
    next(error);
  }
};

// Update user by ID
const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { email, password } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { email, password },
    });

    // Invalidate Redis cache
    await redisClient.del(`user:${id}`);

    logger.info(`User ${id} updated`);
    res.status(200).json(updatedUser);
  } catch (error) {
    logger.error(`Update user error: ${error}`);
    next(error);
  }
};

// Delete user by ID
const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    // Invalidate Redis cache
    await redisClient.del(`user:${id}`);

    logger.info(`User ${id} deleted`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Delete user error: ${error}`);
    next(error);
  }
};

module.exports = { getUser, updateUser, deleteUser };
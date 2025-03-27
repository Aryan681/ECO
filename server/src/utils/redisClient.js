const redis = require('redis');
const logger = require('./logger'); // Ensure you have a logger

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Ensure the client connects before exporting
(async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;
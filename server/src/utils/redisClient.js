const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

// Add caching functions
redisClient.getWithCache = async (key, fetchFn, ttl = 3600) => {
  try {
    // Try to get cached data
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(cachedData);
    }

    // Fetch fresh data if not in cache
    logger.debug(`Cache miss for key: ${key}`);
    const freshData = await fetchFn();
    
    // Store in cache with TTL
    await redisClient.setEx(key, ttl, JSON.stringify(freshData));
    return freshData;
  } catch (err) {
    logger.error('Redis cache error:', err);
    // Fallback to direct fetch if Redis fails
    return await fetchFn();
  }
};

// Connect and export
(async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;  
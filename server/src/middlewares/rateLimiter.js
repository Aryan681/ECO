// middleware/rateLimiter.js
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiterOptions = {
  storeClient: redisClient,
  keyPrefix: 'rate_limit:',
  points: 100, // Number of requests
  duration: 60, // Per 1 minute
};

const rateLimiter = new RateLimiterRedis(rateLimiterOptions);

module.exports = async (req, res, next) => {
  try {
    // Use IP as key for rate limiting
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
};
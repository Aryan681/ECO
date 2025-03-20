const Redis = require('ioredis');

// Create a Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Redis server host
  port: process.env.REDIS_PORT || 6379, // Redis server port
  password: process.env.REDIS_PASSWORD || '', // Redis password (if any)
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Test the Redis connection
redisClient.ping((err, result) => {
  if (err) {
    console.error('Failed to connect to Redis:', err);
  } else {
    console.log('Connected to Redis:', result);
  }
});

module.exports = redisClient;
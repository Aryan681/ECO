// utils/database.js
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

// Connect to PostgreSQL via Prisma
const connectDB = async () => {
  try {
    // Test Prisma connection to PostgreSQL
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
    
    return true;
  } catch (error) { 
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  prisma
};
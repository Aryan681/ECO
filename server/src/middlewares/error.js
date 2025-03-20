// middleware/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database operation failed',
      error: err.message
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JWTVerificationFailed') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
  
  // Default to 500 server error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = {
  errorHandler
};
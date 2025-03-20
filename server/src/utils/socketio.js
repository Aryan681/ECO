// utils/socket.js
const { Server } = require('socket.io');
const { authenticateJWT } = require('../middlewares/auth');
const logger = require('./logger');

// Setup Socket.IO with authentication
const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Create a mock request object for the authenticateJWT middleware
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      
      // Create mock response and next function
      const res = {
        status: () => ({
          json: () => {}
        })
      };
      
      const authNext = (error) => {
        if (error) {
          return next(new Error('Authentication error'));
        }
        
        // If authentication successful, attach user to socket
        socket.user = req.user;
        next();
      };
      
      // Authenticate the socket connection
      await authenticateJWT(req, res, authNext);
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);
    
    // Add more socket event handlers here
    
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });
  
  return io;
};

module.exports = {
  setupSocketIO
};
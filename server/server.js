// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const { pinoHttp } = require('pino-http');
const logger = require('./src/utils/logger');
const { connectDB } = require('./src/utils/database');
const { errorHandler } = require('./src/middlewares/error');
const authRoutes = require('./src/routes/authRoutes');
const codeRoutes = require('./src/routes/codeRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const rateLimiter = require('./src/middlewares/rateLimiter');
const { setupSocketIO } = require('./src/utils/socketio');
const userRoutes = require('./src/routes/userRoute');
const redisClient = require('./src/utils/redisClient');
const profileRoutes = require('./src/routes/profileRoutes'); 
const path = require('path');
const githubAuthRoutes = require('./src/routes/githubAuthRoutes'); 
// const googleAuthRoutes = require('./src/routes/googleAuthRoutes');
const passport = require('./src/config/passport1');
const session = require('express-session');
const spotifyRoutes = require('./src/routes/spotifyRoutes');
const PomoRoute = require ('./src/routes/pomoRoute')
// const connectMDB = require('./src/config/db');
const cookieParser = require('cookie-parser');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
// Middleware
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (for GitHub OAuth)
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/github', githubAuthRoutes);
// app.use('/api/google', googleAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/execute", codeRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/pomo',PomoRoute)

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Add more detailed logging
    logger.info('Starting server initialization...');
    
    await connectDB();
    logger.info('Database connected successfully');
    
    // Test Redis connection earlier
    try {
      await redisClient.ping();
      logger.info('Connected to Redis successfully');
    } catch (redisError) {
      logger.error('Redis connection failed:', redisError);
      throw redisError;
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    setupSocketIO(server);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    // Add more detailed error logging
    if (error.code) logger.error(`Error code: ${error.code}`);
    if (error.stack) logger.error(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}
startServer();

module.exports = app;
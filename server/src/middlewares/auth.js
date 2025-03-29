// middleware/auth.js
const { jwtVerify } = require('jose');
const { createSecretKey } = require('crypto');
const logger = require('../utils/logger');

const accessTokenSecret = createSecretKey(Buffer.from(process.env.JWT_ACCESS_SECRET || 'default_access_secret', 'utf-8'));

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { payload } = await jwtVerify(token, accessTokenSecret);
    req.user = { 
      id: payload.userId,
      authMethod: payload.authMethod // Add auth method to payload
    };
    next();
  } catch (error) {
    logger.error('JWT verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// middleware/auth.js
const checkAuthMethod = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Block password login for GitHub-authenticated users
    if (user.authMethod === 'github') {
      return res.status(403).json({
        success: false,
        message: 'This account uses GitHub login',
        authMethod: 'github'
      });
    }

    next();
  } catch (error) {
    next(error);
  }

};
module.exports = {
  authenticateJWT,
  checkAuthMethod
};
// controllers/githubAuthController.js
const passport = require('../config/passport1');
const { generateAuthTokens } = require('../services/authService');

const githubAuth = passport.authenticate('github', { 
  scope: ['user:email', 'repo'] 
});

const githubCallback = (req, res, next) => {
  passport.authenticate('github', { 
    session: false,
    failureRedirect: false // Essential for JSON response
  }, async (err, user, info) => {
    try {
      // Error handling
      if (err) {
        console.error('GitHub Auth Process Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Authentication process failed',
          error: err.message
        });
      }

      if (!user) {
        console.error('GitHub Auth Failed - No User:', info);
        return res.status(401).json({
          success: false,
          message: info?.message || 'GitHub authentication failed',
          info: info || null
        });
      }

      // Token generation
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      // Successful response
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.firstName,
          avatar: user.profile?.avatarUrl,
          authMethod: 'github'
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Callback Processing Error:', error);
      return next(error);
    }
  })(req, res, next);
};

module.exports = { githubAuth, githubCallback };
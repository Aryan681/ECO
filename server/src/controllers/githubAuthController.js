const passport = require('../config/passport1');
const { generateAuthTokens } = require('../services/authService');

const githubAuth = passport.authenticate('github', { 
  scope: ['user:email', 'repo', 'delete_repo'],
  passReqToCallback: true
});

const githubCallback = (req, res, next) => {
  passport.authenticate('github', { 
    session: false,
    failureRedirect: false
  }, async (err, data, info) => {
    try {
      if (err) {
        console.error('GitHub Auth Process Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Authentication process failed',
          error: err.message
        });
      }

      if (!data || !data.user) {
        console.error('GitHub Auth Failed - No User:', info);
        return res.status(401).json({
          success: false,
          message: info?.message || 'GitHub authentication failed',
          info: info || null
        });
      }

      const { user, token, githubAccessToken } = data;

      // Generate auth tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user);

      // Successful response
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.firstName || user.profile?.username,
          avatar: user.profile?.profileImage,
          authMethod: 'github'
        },
        tokens: {
          accessToken,
          refreshToken
        },
        githubAccessToken: githubAccessToken // Include the fresh token
      });
    } catch (error) {
      console.error('Callback Processing Error:', error);
      return next(error);
    }
  })(req, res, next);
};

module.exports = { githubAuth, githubCallback };
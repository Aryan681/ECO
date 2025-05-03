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
   // Get the origin from the request or use default
   const frontendOrigin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';

   return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GitHub Auth Success</title>
      <script>
        const response = ${JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.profile?.firstName || user.profile?.username,
            avatar: user.profile?.profileImage,
            authProvider: 'github'
          },
          tokens: {
            accessToken,
            refreshToken
          },
          githubAccessToken
        })};
        
        // Try to send to opener with specific origin first
        try {
          window.opener.postMessage(response, '${frontendOrigin}');
        } catch (err) {
          console.error('Specific origin post failed:', err);
          // Fallback to wildcard if needed
          window.opener.postMessage(response, '*');
        }
        window.close();
      </script>
    </head>
    <body>
      <p>Authentication successful. Closing window...</p>
    </body>
    </html>
  `);
   
   
 } catch (error) {
   console.error('Callback Processing Error:', error);
   return next(error);
 }
})(req, res, next);
};

module.exports = { githubAuth, githubCallback };
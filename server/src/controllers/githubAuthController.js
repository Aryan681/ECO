const passport = require('../config/passport1'); // ✅ Use the renamed passport config
const jwt = require('jsonwebtoken');

const githubAuth = passport.authenticate('github', { scope: ['user:email',"repo"] });

const githubCallback = (req, res, next) => {
  passport.authenticate('github', async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_auth_failed`);
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Redirect with the token
    res.redirect(`${process.env.FRONTEND_URL}/auth/github?token=${accessToken}`);
  })(req, res, next);
};

module.exports = { githubAuth, githubCallback };

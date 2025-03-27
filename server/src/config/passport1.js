const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
      scope: ['user:email' , "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              githubId: profile.id,
              githubAccessToken: accessToken,
              profile: {
                create: {
                  firstName: profile.displayName || '',
                  profileImage: profile.photos?.[0]?.value || '',
                },
              },
            },
            include: { profile: true },
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.user.id },
          process.env.JWT_ACCESS_SECRET || 'default_access_secret',
          { expiresIn: '15m' }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;

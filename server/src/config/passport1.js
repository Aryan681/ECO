const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/github/callback",
      scope: ["user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ GitHub OAuth Success - Profile Data:", profile);

        const email = profile.emails?.[0]?.value || null;
        if (!email) {
          console.error("❌ No email found in GitHub profile!");
          return done(null, false);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Create user without requiring a password
          user = await prisma.user.create({
            data: {
              authProvider: "github",
              email,
              githubId: profile.id,
              githubAccessToken: accessToken,
              profile: {
                create: {
                  firstName: profile.displayName || "",
                  profileImage: profile.photos?.[0]?.value || "",
                },
              },
            },
            include: { profile: true },
          });

          console.log("✅ New GitHub User Created:", user);
        } else {
          // Update existing GitHub user with latest access token
          await prisma.user.update({
            where: { email },
            data: { authProvider: "github", // Update to github
              githubId: profile.id, githubAccessToken: accessToken },
          });

          console.log("✅ GitHub User Updated:", user);
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id,
             authMethod: "github"
           },
          process.env.JWT_ACCESS_SECRET || "default_access_secret",
          { expiresIn: "15m" }
        );

        console.log("✅ User Authenticated, Returning Token:", token);

        return done(null, { user, token, githubAccessToken: accessToken });
      } catch (error) {
        console.error("❌ GitHub Auth Error:", error);
        return done(error, null);
      }
    }
  )
  
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;

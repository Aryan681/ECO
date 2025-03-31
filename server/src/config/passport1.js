const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { createClient } = require("redis");

const prisma = new PrismaClient();

// Redis client setup with async/await
let redisClient;

async function initializeRedis() {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  
  await redisClient.connect();
  console.log('Redis client connected and ready');
}

// Initialize Redis immediately
initializeRedis().catch(err => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Function to update token in both DB and Redis
async function updateGitHubToken(userId, email, accessToken) {
  try {
    // Update in PostgreSQL
    await prisma.user.update({
      where: { id: userId },
      data: { githubAccessToken: accessToken }
    });

    // Store in Redis with 1-hour expiration
    if (redisClient.isOpen) {
      await redisClient.set(`github:token:${userId}`, accessToken, {
        EX: 3600
      });
    } else {
      console.warn('Redis client not open, skipping cache update');
    }
  } catch (error) {
    console.error('Error updating GitHub token:', error);
    throw error;
  }
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/github/callback",
      scope: ["user:email", "repo", 'delete_repo'],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ GitHub OAuth Success - Profile Data:", profile);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error("❌ No email found in GitHub profile!");
          return done(null, false, { message: "No email associated with GitHub account" });
        }

        let user = await prisma.user.findUnique({ 
          where: { email },
          include: { profile: true }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              authProvider: "github",
              email,
              githubId: profile.id,
              githubAccessToken: accessToken,
              profile: {
                create: {
                  firstName: profile.displayName || profile.username || "",
                  profileImage: profile.photos?.[0]?.value || "",
                },
              },
            },
            include: { profile: true },
          });
          console.log("✅ New GitHub User Created:", user);
        }

        // Always update the token (for both new and existing users)
        await updateGitHubToken(user.id, email, accessToken);
        console.log("✅ GitHub token updated in DB and Redis");

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, authMethod: "github" },
          process.env.JWT_ACCESS_SECRET || "default_access_secret",
          { expiresIn: "15m" }
        );

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

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redisClient) await redisClient.quit();
  process.exit();
});

module.exports = passport;
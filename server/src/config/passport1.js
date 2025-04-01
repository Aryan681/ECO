const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { createClient } = require("redis");

const prisma = new PrismaClient();

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
(async () => {
  await redisClient.connect();
  console.log('Redis client connected');
})();

// Function to update GitHub token in both DB and Redis
async function updateGitHubToken(userId, accessToken) {
  try {
    // Update in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        githubAccessToken: accessToken,
        updatedAt: new Date()
      }
    });

    // Store in Redis with 1-hour expiration
    await redisClient.set(`github:token:${userId}`, accessToken, {
      EX: 3600 // 1 hour expiration
    });

    return updatedUser;
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
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/auth/github/callback",
      scope: ["user:email", "repo", "delete_repo"],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub profile received:", profile);

        // Extract email - GitHub sometimes returns email in different places
        const email = profile.emails?.[0]?.value || 
                     profile._json?.email || 
                     `${profile.username}@users.noreply.github.com`;

        if (!email) {
          return done(new Error("No email found in GitHub profile"));
        }

        // Check for existing user by email or GitHub ID
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { githubId: profile.id }
            ]
          },
          include: { profile: true }
        });

        // User creation/update data
        const userData = {
          authMethod: "github",
          githubId: profile.id,
          githubAccessToken: accessToken,
          githubUsername: profile.username,
          avatarUrl: profile.photos?.[0]?.value || profile._json?.avatar_url,
          updatedAt: new Date()
        };

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              ...userData,
              email,
              profile: {
                create: {
                  firstName: profile.displayName || profile.username,
                  lastName: "",
                }
              }
            },
            include: { profile: true }
          });
          console.log("New GitHub user created:", user.id);
        } else {
          // Update existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: userData,
            include: { profile: true }
          });
          console.log("Existing user updated:", user.id);
        }

        // Update token in Redis
        await updateGitHubToken(user.id, accessToken);

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id,
            authMethod: "github",
            email: user.email
          },
          process.env.JWT_SECRET || "your_jwt_secret_here",
          { expiresIn: "1h" }
        );

        return done(null, { 
          user: {
            id: user.id,
            email: user.email,
            authMethod: user.authMethod,
            profile: user.profile
          },
          token,
          githubAccessToken: accessToken
        });
      } catch (error) {
        console.error("GitHub authentication error:", error);
        return done(error);
      }
    }
  )
);

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit();
});

module.exports = passport;
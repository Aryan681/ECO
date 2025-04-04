// const passport = require('passport');
// const SpotifyStrategy = require('passport-spotify').Strategy;
// const { encrypt } = require('../utils/encryption');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// passport.use(
//   new SpotifyStrategy(
//     {
//       clientID: process.env.SPOTIFY_CLIENT_ID,
//       clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//       callbackURL: process.env.SPOTIFY_CALLBACK_URL,
//       scope: [
//         'user-read-email',
//         'user-read-private',
//         'user-read-playback-state',
//         'user-modify-playback-state',
//         'user-library-read',
//         'user-library-modify',
//         'playlist-read-private',
//         'playlist-modify-private'
//       ],
//       showDialog: true
//     },
//     async (accessToken, refreshToken, expires_in, profile, done) => {
//       try {
//         const expiresAt = new Date(Date.now() + expires_in * 1000);
        
//         // Encrypt tokens before storage
//         const encryptedAccessToken = encrypt(accessToken);
//         const encryptedRefreshToken = encrypt(refreshToken);

//         const spotifyAccount = await prisma.spotifyAccount.upsert({
//           where: { userId: profile.id },
//           create: {
//             user: { connect: { id: profile.id } },
//             spotifyId: profile.id,
//             accessToken: encryptedAccessToken,
//             refreshToken: encryptedRefreshToken,
//             expiresAt,
//             scope: profile.scope,
//             displayName: profile.displayName,
//             email: profile.emails?.[0]?.value,
//             country: profile.country,
//             product: profile.product,
//             avatarUrl: profile.photos?.[0]?.value
//           },
//           update: {
//             accessToken: encryptedAccessToken,
//             refreshToken: encryptedRefreshToken,
//             expiresAt,
//             scope: profile.scope,
//             displayName: profile.displayName,
//             email: profile.emails?.[0]?.value,
//             country: profile.country,
//             product: profile.product,
//             avatarUrl: profile.photos?.[0]?.value,
//             updatedAt: new Date()
//           }
//         });

//         return done(null, spotifyAccount);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

// module.exports = passport;
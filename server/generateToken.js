const admin = require('firebase-admin');
const serviceAccount = require('./src/config/firebaseAccount.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to get Firebase ID token
const getFirebaseToken = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    const idToken = await admin.auth().createCustomToken(user.uid);

    console.log('Generated Firebase ID Token:', idToken);
    return idToken;
  } catch (error) {
    console.error('Error generating ID token:', error);
  }
};

// Replace with the user's Firebase UID
const userUid = 'WZFebmqBEFa9zOJCWizkHd3NBxu1'; // You can use a UID from your Firebase Console.
getFirebaseToken(userUid);

// // utils/encryption.js
// const crypto = require('crypto');
// const logger = require('./logger');

// // Get encryption key from environment variables
// // Get encryption key from environment variables
// let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
// const ALGORITHM = 'aes-256-cbc';
// const IV_LENGTH = 16;

// // Development fallback (remove in production)
// if (process.env.NODE_ENV !== 'production') {
//   if (!ENCRYPTION_KEY) {
//     ENCRYPTION_KEY = 'devkeyplaceholder12345678901234567890'; // 32 chars
//     logger.warn('Using development encryption key - DO NOT USE IN PRODUCTION');
//   } else if (ENCRYPTION_KEY.length !== 32) {
//     logger.warn('Invalid encryption key length - using development key');
//     ENCRYPTION_KEY = 'devkeyplaceholder12345678901234567890';
//   }
// } else {
//   // Strict validation in production
//   if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
//     logger.error('FATAL: Invalid ENCRYPTION_KEY in production');
//     process.exit(1);
//   }
// }
// function encrypt(text) {
//   if (!text) {
//     throw new Error('No text provided for encryption');
//   }

//   try {
//     const iv = crypto.randomBytes(IV_LENGTH);
//     const cipher = crypto.createCipheriv(
//       ALGORITHM,
//       Buffer.from(ENCRYPTION_KEY, 'hex'),
//       iv
//     );
    
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
    
//     return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
//   } catch (error) {
//     logger.error('Encryption failed:', error);
//     throw new Error('Failed to encrypt data');
//   }
// }

// /**
//  * Decrypts text using AES-256-CBC
//  * @param {string} text - Encrypted text in format: iv:encryptedText
//  * @returns {string} - Decrypted plaintext
//  */
// function decrypt(text) {
//   if (!text) {
//     throw new Error('No text provided for decryption');
//   }

//   try {
//     const [ivHex, encryptedHex] = text.split(':');
    
//     if (!ivHex || !encryptedHex) {
//       throw new Error('Invalid encrypted text format');
//     }
    
//     const iv = Buffer.from(ivHex, 'hex');
//     const encryptedText = Buffer.from(encryptedHex, 'hex');
//     const decipher = crypto.createDecipheriv(
//       ALGORITHM,
//       Buffer.from(ENCRYPTION_KEY, 'hex'),
//       iv
//     );
    
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
    
//     return decrypted.toString();
//   } catch (error) {
//     logger.error('Decryption failed:', error);
//     throw new Error('Failed to decrypt data');
//   }
// }

// /**
//  * Generates a random encryption key (32 bytes)
//  * @returns {string} - Hex encoded key
//  */
// function generateKey() {
//   return crypto.randomBytes(32).toString('hex');
// }

// module.exports = {
//   encrypt,
//   decrypt,
//   generateKey
// };
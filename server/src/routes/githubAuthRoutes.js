const express = require('express');
const passport = require('passport');
const { githubAuth, githubCallback } = require('../controllers/githubAuthController');

const router = express.Router();

// GitHub OAuth route
router.get('/login', githubAuth);
router.get('/callback', githubCallback);

module.exports = router;
  
const express = require('express');
const router = express.Router();
const { getUser, updateUser, deleteUser } = require('../controllers/userController');

// Get user by ID
router.get('/:id', getUser);

// Update user by ID
router.put('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUser);

module.exports = router;
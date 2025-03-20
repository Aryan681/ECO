// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateJWT } = require('../middlewares/auth');

// All project routes require authentication
router.use(authenticateJWT);

// Project routes
router.get('/', projectController.getUserProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Project logs routes
router.get('/:id/logs', projectController.getProjectLogs);
router.post('/:id/logs', projectController.addProjectLog);

module.exports = router;
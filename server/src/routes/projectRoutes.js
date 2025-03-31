    // routes/projectRoutes.js
    const express = require('express');
    const router = express.Router();
    const { getGitHubRepos ,createRepository , deleteRepository } = require('../controllers/projectController');
    const { authenticate } = require('../middlewares/auth');

    // All project routes require authentication
    router.use(authenticate);

    // Project routes
    router.get('/repos', getGitHubRepos);
    router.post('/repos', createRepository);
    router.delete('/repos/:owner/:repo', deleteRepository);
    // router.post('/', projectController.createProject);
    // router.get('/:name', projectController.getProjectByName)
    // router.put('/:id', projectController.updateProject);
    // router.delete('/:id', projectController.deleteProject);

    // // Project logs routes
    // router.get('/:id/logs', projectController.getProjectLogs);
    // router.post('/:id/logs', projectController.addProjectLog);

    module.exports = router;
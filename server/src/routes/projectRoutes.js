const express = require("express");
const router = express.Router();
const {
  getGitHubRepos,
  createRepository,
  deleteRepository,
  updateRepository,
  searchRepositories

} = require("../controllers/projectController");
const { authenticate } = require("../middlewares/auth"); // Use the new authenticate middleware

// All project routes require authentication (works with both JWT and GitHub tokens)
router.use(authenticate); // Changed from authenticateJWT

// Project routes
router.get("/repos", getGitHubRepos);

router.post("/repos", createRepository);
router.delete('/repos/:owner/:repo', deleteRepository);
router.patch('/repos/:owner/:repo', updateRepository);
router.get('/repos/search', searchRepositories);

// // Project logs routes
// router.get('/:id/logs', projectController.getProjectLogs);
// router.post('/:id/logs', projectController.addProjectLog);

module.exports = router;

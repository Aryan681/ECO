const { fetchGitHubRepos, createGitHubRepo ,deleteGitHubRepo,updateGitHubRepo ,searchGitHubRepos} = require('../services/projectService');

const getGitHubRepos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const repos = await fetchGitHubRepos(userId);
    
    res.json({
      success: true,
      data: repos,
      count: repos.length,
      message: `Successfully fetched ${repos.length} repositories`
    });
  } catch (error) {
    console.error('Controller error in getGitHubRepos:', error);
    
    const statusCode = error.statusCode || 
                      (error.message.includes('not found') ? 404 : 
                      (error.message.includes('expired') || error.message.includes('authentication')) ? 401 : 
                      (error.message.includes('rate limit')) ? 429 : 500);
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch GitHub repositories',
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : null
    });
  }
};

const createRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const repoData = req.body;

    // Validate required fields
    if (!repoData.name) {
      return res.status(400).json({
        success: false,
        message: 'Repository name is required'
      });
    }

    // Set default values
    const creationData = {
      name: repoData.name,
      description: repoData.description || '',
      private: repoData.private || false,
      auto_init: repoData.auto_init || false,
      ...repoData
    };

    const newRepo = await createGitHubRepo(userId, creationData);
    
    res.status(201).json({
      success: true,
      message: 'Repository created successfully',
      data: newRepo
    });
  } catch (error) {
    console.error('Error in createRepository:', error);
    
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('validation') ? 422 : 
                      error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : null
    });
  }
};

// Add this new controller method
const deleteRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Repository owner and name are required'
      });
    }

    const result = await deleteGitHubRepo(userId, owner, repo);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        repository: result.repo
      }
    });
  } catch (error) {
    console.error('Error in deleteRepository:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('authentication') ? 401 : 
                      error.message.includes('Permission denied') ? 403 : 
                      500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : null
    });
  }
};

// Add this new controller method
const updateRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;
    const updateData = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Repository owner and name are required'
      });
    }

    // Validate at least one field is being updated
    const validFields = ['name', 'description', 'private', 'visibility'];
    if (!Object.keys(updateData).some(field => validFields.includes(field))) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid field must be provided for update',
        validFields
      });
    }

    const updatedRepo = await updateGitHubRepo(userId, owner, repo, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Repository updated successfully',
      data: updatedRepo
    });
  } catch (error) {
    console.error('Error in updateRepository:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('authentication') ? 401 : 
                      error.message.includes('Permission denied') ? 403 : 
                      error.message.includes('Invalid update data') ? 422 : 
                      500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : null
    });
  }
};


// Add this new controller method
const searchRepositories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required and must be a non-empty string'
      });
    }

    const repos = await searchGitHubRepos(userId, q.trim());
    
    res.status(200).json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    console.error('Error in searchRepositories:', error);
    
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('rate limit') ? 429 : 
                      error.message.includes('Invalid search') ? 422 : 
                      500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : 
              statusCode === 429 ? 'Try again later' : null
    });
  }
};

// Update your exports
module.exports = { 
  getGitHubRepos,
  createRepository,
  deleteRepository,
  updateRepository,
  searchRepositories
};

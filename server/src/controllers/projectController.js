const { fetchGitHubRepos ,createGitHubRepo } = require('../services/projectService');

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
                      (error.message.includes('rate limit')) ? 429 : 500 );
    
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

const deleteRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;

    // Validate parameters
    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: 'Both owner and repository name are required'
      });
    }

    const success = await deleteGitHubRepo(userId, owner, repo);
    
    res.status(200).json({
      success: true,
      message: `Repository ${owner}/${repo} deleted successfully`
    });
  } catch (error) {
    console.error('Error in deleteRepository:', error);
    
    const statusCode = error.message.includes('authentication') ? 401 : 
                      error.message.includes('Permission') ? 403 :
                      error.message.includes('not found') ? 404 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      action: statusCode === 401 ? 'Reauthenticate with GitHub' : null
    });
  }
};


module.exports = { getGitHubRepos , createRepository,deleteRepository };
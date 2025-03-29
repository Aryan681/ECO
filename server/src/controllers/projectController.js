const { PrismaClient } = require('@prisma/client');
const { validateProject } = require('../utils/datavalidator');
const logger = require('../utils/logger');
const axios = require('axios').create({
  timeout: 5000,
  maxRedirects: 0
});
const prisma = new PrismaClient({
  log: ['warn', 'error']
});
const GITHUB_API_URL = 'https://api.github.com';

// Shared configurations
const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation error',
  GITHUB_TOKEN_MISSING: 'GitHub OAuth token missing',
  PROJECT_NOT_FOUND: 'Project not found or unauthorized',
  LOGS_NOT_FOUND: 'Project logs not found'
};

const GITHUB_API_CONFIG = (token) => ({
  headers: { 
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

const handleGitHubError = (error) => {
  if (error.response) {
    logger.error(`GitHub API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    throw new Error(`GitHub API request failed: ${error.response.status}`);
  }
  throw error;
};

// Get all projects for the authenticated user
const getUserProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      include: { logs: true }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    logger.error('Get user projects error:', error);
    next(error);
  }
};

// Get project by name
const getProjectByName = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { 
        name: req.params.name,
        userId: req.user.id 
      },
      include: { logs: true }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: ERROR_MESSAGES.PROJECT_NOT_FOUND 
      });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Get project by name error:', error);
    next(error);
  }
};

// Create project (with GitHub sync)
const createProject = async (req, res, next) => {
  try {
    const { id: userId, githubToken, githubUsername } = req.user;
    const validationResult = validateProject(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.VALIDATION_FAILED, 
        errors: validationResult.error.errors 
      });
    }
    
    if (!githubToken) {
      return res.status(403).json({ 
        success: false, 
        message: ERROR_MESSAGES.GITHUB_TOKEN_MISSING 
      });
    }

    const { name, description } = validationResult.data;
    
    // GitHub repo creation
    const githubRepo = await axios.post(
      `${GITHUB_API_URL}/user/repos`,
      { name, description, private: true },
      GITHUB_API_CONFIG(githubToken)
    ).catch(handleGitHubError);

    // Database creation
    const project = await prisma.project.create({
      data: { 
        name, 
        description, 
        githubUrl: githubRepo.data.html_url, 
        githubRepoId: githubRepo.data.id, 
        userId,
        logs: { create: [] } // Initialize with empty logs
      },
      include: { logs: true }
    });
    
    res.status(201).json({ 
      success: true, 
      data: project,
      message: 'Project created and synced with GitHub' 
    });
  } catch (error) {
    logger.error('Create project error:', error);
    next(error);
  }
};

// Update project (with GitHub sync)
const updateProject = async (req, res, next) => {
  try {
    const { id: userId, githubToken, githubUsername } = req.user;
    const projectId = req.params.id;
    const validationResult = validateProject(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: ERROR_MESSAGES.VALIDATION_FAILED, 
        errors: validationResult.error.errors 
      });
    }
    
    const project = await prisma.project.findUnique({ 
      where: { id: projectId } 
    });
    
    if (!project || project.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: ERROR_MESSAGES.PROJECT_NOT_FOUND 
      });
    }
    
    if (!githubToken) {
      return res.status(403).json({ 
        success: false, 
        message: ERROR_MESSAGES.GITHUB_TOKEN_MISSING 
      });
    }

    const { name, description } = validationResult.data;
    
    // GitHub repo update
    await axios.patch(
      `${GITHUB_API_URL}/repos/${githubUsername}/${project.name}`,
      { name, description },
      GITHUB_API_CONFIG(githubToken)
    ).catch(handleGitHubError);

    // Database update
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name, description },
      include: { logs: true }
    });
    
    res.json({ 
      success: true, 
      data: updatedProject,
      message: 'Project updated and synced with GitHub' 
    });
  } catch (error) {
    logger.error('Update project error:', error);
    next(error);
  }
};

// Delete project (with GitHub sync)
const deleteProject = async (req, res, next) => {
  try {
    const { id: userId, githubToken, githubUsername } = req.user;
    const projectId = req.params.id;
    
    const project = await prisma.project.findUnique({ 
      where: { id: projectId } 
    });
    
    if (!project || project.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: ERROR_MESSAGES.PROJECT_NOT_FOUND 
      });
    }
    
    if (!githubToken) {
      return res.status(403).json({ 
        success: false, 
        message: ERROR_MESSAGES.GITHUB_TOKEN_MISSING 
      });
    }

    // GitHub repo deletion
    await axios.delete(
      `${GITHUB_API_URL}/repos/${githubUsername}/${project.name}`,
      GITHUB_API_CONFIG(githubToken)
    ).catch(handleGitHubError);

    // Database deletion
    await prisma.project.delete({ 
      where: { id: projectId } 
    });
    
    res.json({ 
      success: true, 
      message: 'Project deleted from system and GitHub' 
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    next(error);
  }
};

// Get project logs
const getProjectLogs = async (req, res, next) => {
  try {
    const logs = await prisma.projectLog.findMany({
      where: { projectId: req.params.id }
    });
    
    if (!logs.length) {
      return res.status(404).json({ 
        success: false, 
        message: ERROR_MESSAGES.LOGS_NOT_FOUND 
      });
    }
    
    res.json({ success: true, data: logs });
  } catch (error) {
    logger.error('Get project logs error:', error);
    next(error);
  }
};

// Add project log
const addProjectLog = async (req, res, next) => {
  try {
    const log = await prisma.projectLog.create({
      data: {
        message: req.body.message,
        type: req.body.type || 'INFO',
        projectId: req.params.id
      }
    });
    
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    logger.error('Add project log error:', error);
    next(error);
  }
};

module.exports = {
  getUserProjects,
  getProjectByName,
  createProject,
  updateProject,
  deleteProject,
  getProjectLogs,
  addProjectLog
};
// controllers/projectController.js
const { PrismaClient } = require('@prisma/client');
const { validateProject } = require('../utils/datavalidator');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get all projects for the authenticated user
const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const projects = await prisma.project.findMany({
      where: {
        userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        projects
      }
    });
  } catch (error) {
    logger.error('Get user projects error:', error);
    next(error);
  }
};

// Get a specific project by ID
const getProjectById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectName = req.params.name; // Assuming the project name is passed as a parameter

    // Use regex to search for the project by name
    const project = await prisma.project.findFirst({
      where: {
        name: {
          contains: projectName, // Case-insensitive search
          mode: 'insensitive' // Ensure case-insensitive matching
        },
        userId: userId // Ensure the project belongs to the user
      },
      include: {
        logs: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 100 // Limit logs to the most recent 100
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Get project by ID error:', error);
    next(error);
  }
};

// Create a new project
const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Validate project data
    const validationResult = validateProject(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { name, description, githubUrl, githubRepoId } = validationResult.data;
    
    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        githubUrl,
        githubRepoId,
        userId
      }
    });
    
    // Create an initial log entry
    await prisma.log.create({
      data: {
        message: `Project "${name}" created`,
        projectId: project.id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });
  } catch (error) {
    logger.error('Create project error:', error);
    next(error);
  }
};

// Update a project
const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    
    // Find the project first
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    // Check if project exists and belongs to user
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (existingProject.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project'
      });
    }
    
    // Validate project data
    const validationResult = validateProject(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors
      });
    }
    
    const { name, description, githubUrl, githubRepoId } = validationResult.data;
    
    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name,
        description,
        githubUrl,
        githubRepoId
      }
    });
    
    // Create a log entry
    await prisma.log.create({
      data: {
        message: `Project updated`,
        projectId
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    logger.error('Update project error:', error);
    next(error);
  }
};

// Delete a project
const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    
    // Find the project first
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    // Check if project exists and belongs to user
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (existingProject.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this project'
      });
    }
    
    // Delete all logs first (due to foreign key constraint)
    await prisma.log.deleteMany({
      where: {
        projectId
      }
    });
    
    // Delete the project
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Delete project error:', error);
    next(error);
  }
};

// Add a log entry to a project
const addProjectLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Log message is required'
      });
    }
    
    // Find the project first
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    // Check if project exists and belongs to user
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    if (existingProject.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add logs to this project'
      });
    }
    
    // Create the log entry
    const log = await prisma.log.create({
      data: {
        message,
        projectId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Log added successfully',
      data: {
        log
      }
    });
  } catch (error) {
    logger.error('Add project log error:', error);
    next(error);
  }
};

// Get logs for a project
const getProjectLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectName = req.params.name; // Assuming the project name is passed as a parameter

    // Find the project first
    const existingProject = await prisma.project.findFirst({
      where: {
        name: {
          contains: projectName, // Case-insensitive search
          mode: 'insensitive' // Ensure case-insensitive matching
        },
        userId: userId // Ensure the project belongs to the user
      }
    });

    // Check if project exists and belongs to user
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (existingProject.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view logs for this project'
      });
    }

    // Get logs with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await prisma.log.findMany({
      where: {
        projectName: existingProject.name // Use the project name to fetch logs
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: limit
    });

    const totalLogs = await prisma.log.count({
      where: {
        projectName: existingProject.name // Use the project name to count logs
      }
    });

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page,
          limit,
          pages: Math.ceil(totalLogs / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get project logs error:', error);
    next(error);
  }
};

module.exports = {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectLog,
  getProjectLogs
};
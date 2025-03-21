// controllers/profileController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Get profile
const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    logger.error(`Get profile error: ${error}`);
    next(error);
  }
};

// Update profile (excluding image)
const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { firstName, lastName, bio } = req.body;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { firstName, lastName, bio },
    });

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    logger.error(`Update profile error: ${error}`);
    next(error);
  }
};

// Delete profile
const deleteProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Delete the profile
    await prisma.profile.delete({
      where: { userId },
    });

    res.status(204).send();
  } catch (error) {
    logger.error(`Delete profile error: ${error}`);
    next(error);
  }
};

// Upload profile image
const uploadProfileImage = async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const profileImagePath = req.file.path;

    // Update the profile with the new image path
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { profileImage: profileImagePath },
    });

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    logger.error(`Upload profile image error: ${error}`);
    next(error);
  }
};

// Delete profile image
const deleteProfileImage = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Get the current profile to find the image path
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.profileImage) {
      return res.status(404).json({ success: false, message: 'Profile image not found' });
    }

    // Delete the image file from the server
    fs.unlink(profile.profileImage, (err) => {
      if (err) {
        logger.error(`Delete profile image file error: ${err}`);
      }
    });

    // Update the profile to remove the image path
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { profileImage: null },
    });

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    logger.error(`Delete profile image error: ${error}`);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadProfileImage,
  deleteProfileImage,
};
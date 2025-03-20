// utils/validators.js
const { z } = require('zod');

// User registration validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional()
});

// User login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Profile update validation schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').optional(),
  lastName: z.string().max(50, 'Last name is too long').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
});

// Project validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  githubRepoId: z.number().int().positive('Invalid GitHub repository ID').optional(),
});

// Validate registration data
const validateRegisterData = (data) => {
  try {
    const result = registerSchema.safeParse(data);
    return result;
  } catch (error) {
    return { success: false, error };
  }
};

// Validate login data
const validateLoginData = (data) => {
  try {
    const result = loginSchema.safeParse(data);
    return result;
  } catch (error) {
    return { success: false, error };
  }
};

// Validate profile update data
const validateProfileUpdate = (data) => {
  try {
    const result = profileUpdateSchema.safeParse(data);
    return result;
  } catch (error) {
    return { success: false, error };
  }
};

// Validate project data
const validateProject = (data) => {
  try {
    const result = projectSchema.safeParse(data);
    return result;
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = {
  validateRegisterData,
  validateLoginData,
  validateProfileUpdate,
  validateProject
};
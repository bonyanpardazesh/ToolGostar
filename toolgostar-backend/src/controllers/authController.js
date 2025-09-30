/**
 * Authentication Controller
 * Handle user authentication and authorization
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      logger.security('Login attempt with invalid email', { email, ip: req.ip });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.security('Login attempt with inactive user', { userId: user.id, email, ip: req.ip });
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      logger.security('Login attempt with invalid password', { userId: user.id, email, ip: req.ip });
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    console.log('🔑 JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '24h');
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'toolgostar-api',
        audience: 'toolgostar-admin'
      }
    );

    // Update last login
    await user.updateLastLogin();

    // Cache user session
    await cache.set(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLogin: new Date()
    }, 24 * 60 * 60); // 24 hours

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin
        }
      },
      message: 'Login successful'
    });
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const { user } = req;

    // Remove user from cache
    await cache.del(`user:${user.id}`);

    // In a more sophisticated setup, you would blacklist the JWT token
    // For now, we rely on client-side token removal

    logger.info('User logged out', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const { user } = req;

    // Get fresh user data from database
    const currentUser = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!currentUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: currentUser
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const { user } = req;
    const { firstName, lastName, email } = req.body;

    // Get current user
    const currentUser = await User.findByPk(user.id);
    if (!currentUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== currentUser.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
      }
    }

    // Update user data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase();

    await currentUser.update(updateData);

    // Update cache
    await cache.set(`user:${user.id}`, {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      lastLogin: currentUser.lastLogin
    }, 24 * 60 * 60);

    logger.info('User profile updated', { 
      userId: currentUser.id,
      changes: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: currentUser,
      message: 'Profile updated successfully'
    });
  });

  /**
   * Change password
   * PUT /api/v1/auth/password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { user } = req;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('All password fields are required', 400, 'MISSING_FIELDS');
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('New passwords do not match', 400, 'PASSWORD_MISMATCH');
    }

    if (newPassword.length < 8) {
      throw new AppError('New password must be at least 8 characters long', 400, 'PASSWORD_TOO_SHORT');
    }

    // Get current user
    const currentUser = await User.findByPk(user.id);
    if (!currentUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Validate current password
    const isValidPassword = await currentUser.validatePassword(currentPassword);
    if (!isValidPassword) {
      logger.security('Invalid current password during password change', { 
        userId: currentUser.id,
        ip: req.ip
      });
      throw new AppError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
    }

    // Update password
    currentUser.passwordHash = newPassword; // Will be hashed by model hook
    await currentUser.save();

    logger.info('Password changed successfully', { userId: currentUser.id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { user } = req;

    // Generate new token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'toolgostar-api',
        audience: 'toolgostar-admin'
      }
    );

    res.json({
      success: true,
      data: { token },
      message: 'Token refreshed successfully'
    });
  });

  /**
   * Get authentication status
   * GET /api/v1/auth/status
   */
  getStatus = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({
        success: true,
        data: {
          authenticated: false,
          user: null
        }
      });
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user || !user.isActive) {
        return res.json({
          success: true,
          data: {
            authenticated: false,
            user: null
          }
        });
      }

      res.json({
        success: true,
        data: {
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          authenticated: false,
          user: null
        }
      });
    }
  });
}

module.exports = new AuthController();

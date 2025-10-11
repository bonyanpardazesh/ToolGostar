/**
 * User Management Routes
 * /api/v1/users
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { userSchemas } = require('../validations/userValidation');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/',
  verifyToken,
  requireAdmin,
  hasPermission('read:users'),
  validateRequest(userSchemas.query),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  verifyToken,
  requireAdmin,
  hasPermission('read:users'),
  userController.getUserStats
);

/**
 * @route   GET /api/v1/users/export
 * @desc    Export users to CSV
 * @access  Private (Admin only)
 */
router.get('/export',
  verifyToken,
  requireAdmin,
  hasPermission('read:users'),
  userController.exportUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get single user by ID
 * @access  Private (Admin only)
 */
router.get('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('read:users'),
  userController.getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/',
  verifyToken,
  requireAdmin,
  hasPermission('write:users'),
  validateRequest(userSchemas.create),
  userController.createUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('write:users'),
  validateRequest(userSchemas.update),
  userController.updateUser
);

/**
 * @route   PUT /api/v1/users/:id/status
 * @desc    Update user status (active/inactive)
 * @access  Private (Admin only)
 */
router.put('/:id/status',
  verifyToken,
  requireAdmin,
  hasPermission('write:users'),
  validateRequest(userSchemas.updateStatus),
  userController.updateUserStatus
);

/**
 * @route   PUT /api/v1/users/:id/password
 * @desc    Reset user password
 * @access  Private (Admin only)
 */
router.put('/:id/password',
  verifyToken,
  requireAdmin,
  hasPermission('write:users'),
  validateRequest(userSchemas.resetPassword),
  userController.resetUserPassword
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('delete:users'),
  userController.deleteUser
);

module.exports = router;

/**
 * User Controller
 * Handles all user management operations
 */

const { User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/error');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

class UserController {
  /**
   * @route   GET /api/v1/users
   * @desc    Get all users with filtering and pagination
   * @access  Private (Admin only)
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status) {
      whereClause.isActive = status === 'active';
    }
    
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get users (exclude password hash)
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['passwordHash'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  });

  /**
   * @route   GET /api/v1/users/:id
   * @desc    Get single user by ID
   * @access  Private (Admin only)
   */
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  });

  /**
   * @route   POST /api/v1/users
   * @desc    Create new user
   * @access  Private (Admin only)
   */
  createUser = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role, isActive = true } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400, 'USER_EXISTS');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: role || 'editor',
      isActive
    });

    // Return user without password hash
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    logger.info(`User created: ${user.email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { user: userResponse },
      message: 'User created successfully'
    });
  });

  /**
   * @route   PUT /api/v1/users/:id
   * @desc    Update user
   * @access  Private (Admin only)
   */
  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Prevent updating own role to non-admin
    if (req.user.id === parseInt(id) && updateData.role && updateData.role !== 'admin') {
      throw new AppError('You cannot change your own role from admin', 400, 'INVALID_ROLE_CHANGE');
    }

    // Hash password if provided
    if (updateData.password) {
      const saltRounds = 12;
      updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    await user.update(updateData);

    // Return updated user without password hash
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });

    logger.info(`User updated: ${updatedUser.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully'
    });
  });

  /**
   * @route   DELETE /api/v1/users/:id
   * @desc    Delete user
   * @access  Private (Admin only)
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Prevent deleting own account
    if (req.user.id === parseInt(id)) {
      throw new AppError('You cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
    }

    await user.destroy();

    logger.info(`User deleted: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  });

  /**
   * @route   PUT /api/v1/users/:id/status
   * @desc    Update user status (active/inactive)
   * @access  Private (Admin only)
   */
  updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Prevent deactivating own account
    if (req.user.id === parseInt(id) && !isActive) {
      throw new AppError('You cannot deactivate your own account', 400, 'CANNOT_DEACTIVATE_SELF');
    }

    await user.update({ isActive });

    logger.info(`User status updated: ${user.email} to ${isActive ? 'active' : 'inactive'} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { user },
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  });

  /**
   * @route   PUT /api/v1/users/:id/password
   * @desc    Reset user password
   * @access  Private (Admin only)
   */
  resetUserPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ passwordHash });

    logger.info(`Password reset for user: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  });

  /**
   * @route   GET /api/v1/users/stats
   * @desc    Get user statistics
   * @access  Private (Admin only)
   */
  getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const editorUsers = await User.count({ where: { role: 'editor' } });
    
    // Get recent users
    const recentUsers = await User.findAll({
      limit: 10,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });

    // Get role distribution
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // Get monthly user trends (last 12 months)
    const monthlyStats = await User.findAll({
      attributes: [
        [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt')), 'month'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      },
      group: [User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt'))],
      order: [[User.sequelize.fn('DATE_TRUNC', 'month', User.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          adminUsers,
          editorUsers
        },
        roleStats,
        monthlyStats,
        recentUsers
      }
    });
  });

  /**
   * @route   GET /api/v1/users/export
   * @desc    Export users to CSV
   * @access  Private (Admin only)
   */
  exportUsers = asyncHandler(async (req, res) => {
    const { role, status } = req.query;

    // Build where clause
    const whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.isActive = status === 'active';

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });

    // Generate CSV
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Role',
      'Status',
      'Last Login',
      'Created Date'
    ];

    const rows = users.map(user => [
      user.id,
      user.firstName || '',
      user.lastName || '',
      user.email,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      user.lastLoginAt ? user.lastLoginAt.toISOString().split('T')[0] : 'Never',
      user.createdAt.toISOString().split('T')[0]
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  });
}

module.exports = new UserController();

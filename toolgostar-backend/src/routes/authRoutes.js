/**
 * Authentication Routes
 * /api/v1/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, userRateLimit, logActivity } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { authSchemas } = require('../validations/authValidation');
const rateLimit = require('express-rate-limit');

// Specific rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 login attempts per 5 minutes
  message: 'Too many login attempts, please try again after 5 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', 
  strictAuthRateLimit,
  validateRequest(authSchemas.login),
  logActivity('login'),
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate token on server side)
 * @access  Private
 */
router.post('/logout',
  verifyToken,
  logActivity('logout'),
  authController.logout
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  verifyToken,
  userRateLimit(50, 15), // 50 requests per 15 minutes
  authController.getProfile
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  verifyToken,
  authRateLimit,
  validateRequest(authSchemas.updateProfile),
  logActivity('profile_update'),
  authController.updateProfile
);

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password',
  verifyToken,
  authRateLimit,
  validateRequest(authSchemas.changePassword),
  logActivity('password_change'),
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh',
  verifyToken,
  userRateLimit(20, 15), // 20 refresh requests per 15 minutes
  authController.refreshToken
);

/**
 * @route   GET /api/v1/auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get('/status',
  userRateLimit(100, 15), // 100 status checks per 15 minutes
  authController.getStatus
);

module.exports = router;

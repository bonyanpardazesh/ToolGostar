/**
 * Authentication Middleware
 * JWT token verification and user authorization
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError, asyncHandler } = require('./error');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Verify JWT token and extract user
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401, 'NO_TOKEN');
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (skip cache for now since Redis is not available)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw new AppError('Invalid token. User not found.', 401, 'USER_NOT_FOUND');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.security('Inactive user attempted access', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });
      throw new AppError('Account is deactivated.', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.security('Invalid JWT token', {
        token: token.substring(0, 10) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AppError('Invalid token.', 401, 'INVALID_TOKEN');
    }

    if (error.name === 'TokenExpiredError') {
      logger.security('Expired JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AppError('Token has expired.', 401, 'TOKEN_EXPIRED');
    }

    throw error;
  }
});

/**
 * Require admin role
 */
const requireAdmin = [
  verifyToken,
  asyncHandler(async (req, res, next) => {
    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      logger.security('Non-admin user attempted admin access', {
        userId: req.user?.id,
        role: req.user?.role,
        ip: req.ip,
        url: req.originalUrl
      });
      throw new AppError('Access denied. Admin role required.', 403, 'ADMIN_REQUIRED');
    }

    next();
  })
];

/**
 * Require editor role or higher
 */
const requireEditor = [
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const allowedRoles = ['admin', 'editor'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.security('Insufficient permissions for editor access', {
        userId: req.user?.id,
        role: req.user?.role,
        ip: req.ip,
        url: req.originalUrl
      });
      throw new AppError('Access denied. Editor role or higher required.', 403, 'EDITOR_REQUIRED');
    }

    next();
  })
];

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    await verifyToken(req, res, () => {});
  } catch (error) {
    // Log the error but don't fail the request
    logger.warn('Optional auth failed', {
      error: error.message,
      ip: req.ip
    });
  }

  next();
});

/**
 * Check if user owns resource or is admin
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    // First verify token
    await verifyToken(req, res, () => {});

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const resourceUserId = req.body[resourceUserIdField] || 
                          req.params[resourceUserIdField] ||
                          req.query[resourceUserIdField];

    if (!resourceUserId || resourceUserId !== req.user.id) {
      logger.security('User attempted to access resource they do not own', {
        userId: req.user.id,
        resourceUserId,
        ip: req.ip,
        url: req.originalUrl
      });
      throw new AppError('Access denied. You can only access your own resources.', 403, 'OWNERSHIP_REQUIRED');
    }

    next();
  });
};

/**
 * Rate limit per user
 */
const userRateLimit = (maxRequests = 100, windowMinutes = 15) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const key = `user_rate_limit:${req.user.id}`;
    const windowSeconds = windowMinutes * 60;

    const current = await cache.incr(key, windowSeconds);

    if (current > maxRequests) {
      logger.security('User rate limit exceeded', {
        userId: req.user.id,
        current,
        maxRequests,
        ip: req.ip
      });

      throw new AppError(
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMinutes} minutes.`,
        429,
        'USER_RATE_LIMIT_EXCEEDED'
      );
    }

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
      'X-RateLimit-Reset': new Date(Date.now() + windowSeconds * 1000)
    });

    next();
  });
};

/**
 * Log user activity
 */
const logActivity = (action) => {
  return (req, res, next) => {
    // Log after response is sent
    res.on('finish', () => {
      if (req.user) {
        logger.info('User activity', {
          userId: req.user.id,
          email: req.user.email,
          action,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
    });

    next();
  };
};

/**
 * Validate API key (alternative authentication method)
 */
const validateApiKey = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new AppError('API key required', 401, 'API_KEY_REQUIRED');
  }

  // In a real implementation, you would validate against stored API keys
  // For now, we'll use a simple environment variable
  const validApiKey = process.env.API_KEY;

  if (!validApiKey || apiKey !== validApiKey) {
    logger.security('Invalid API key attempt', {
      apiKey: apiKey.substring(0, 8) + '...',
      ip: req.ip
    });
    throw new AppError('Invalid API key', 401, 'INVALID_API_KEY');
  }

  // Set a dummy user for API key authentication
  req.user = {
    id: 'api-user',
    email: 'api@toolgostar.com',
    role: 'api',
    firstName: 'API',
    lastName: 'User'
  };

  next();
});

/**
 * Check if user has specific permission
 */
const hasPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Define role permissions
    const rolePermissions = {
      editor: [
        'read:products',
        'write:products',
        'read:projects',
        'write:projects',
        'read:news',
        'write:news',
        'read:contacts'
      ],
      viewer: [
        'read:products',
        'read:projects',
        'read:news',
        'read:contacts'
      ]
    };

    const userPermissions = rolePermissions[req.user.role] || [];

    if (!userPermissions.includes(permission)) {
      logger.security('Insufficient permissions', {
        userId: req.user.id,
        role: req.user.role,
        requiredPermission: permission,
        ip: req.ip
      });
      throw new AppError(`Permission denied. Required: ${permission}`, 403, 'PERMISSION_DENIED');
    }

    next();
  });
};

/**
 * Middleware to check authentication status without failing
 */
const checkAuthStatus = asyncHandler(async (req, res, next) => {
  req.isAuthenticated = false;
  req.user = null;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (user && user.isActive) {
        req.isAuthenticated = true;
        req.user = user;
      }
    } catch (error) {
      // Silently fail - this is just for status checking
    }
  }

  next();
});

module.exports = {
  verifyToken,
  requireAdmin,
  requireEditor,
  optionalAuth,
  requireOwnershipOrAdmin,
  userRateLimit,
  logActivity,
  validateApiKey,
  hasPermission,
  checkAuthStatus
};

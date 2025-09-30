/**
 * Rate Limiting Middleware
 * Protect API from abuse and ensure fair usage
 */

const rateLimit = require('express-rate-limit');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Default rate limit configuration
 */
const defaultConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
  onLimitReached: (req, res, options) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
  }
};

/**
 * Setup basic rate limiting
 */
const setupRateLimit = () => {
  return rateLimit(defaultConfig);
};

/**
 * Strict rate limiting for sensitive endpoints
 */
const strictRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 requests per 15 minutes
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts, please try again in 15 minutes'
    }
  }
});

/**
 * Moderate rate limiting for API endpoints
 */
const apiRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes for API
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded, please try again later'
    }
  }
});

/**
 * Lenient rate limiting for public endpoints
 */
const publicRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes for public endpoints
  message: {
    success: false,
    error: {
      code: 'PUBLIC_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});

/**
 * File upload rate limiting
 */
const uploadRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many file uploads, please try again in an hour'
    }
  }
});

/**
 * Contact form rate limiting
 */
const contactRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact submissions per hour
  message: {
    success: false,
    error: {
      code: 'CONTACT_RATE_LIMIT_EXCEEDED',
      message: 'Too many contact form submissions, please try again in an hour'
    }
  },
  keyGenerator: (req) => {
    // Use email if provided, otherwise IP
    return req.body?.email || req.ip || req.connection.remoteAddress;
  }
});

/**
 * Search rate limiting
 */
const searchRateLimit = rateLimit({
  ...defaultConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests, please try again in a minute'
    }
  }
});

/**
 * Custom rate limiter using Redis
 */
const createCustomRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    keyPrefix = 'rate_limit',
    keyGenerator = (req) => req.ip,
    message = 'Too many requests'
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${keyPrefix}:${keyGenerator(req)}`;
      const current = await cache.incr(key, Math.ceil(windowMs / 1000));
      
      if (current > max) {
        logger.security('Custom rate limit exceeded', {
          ip: req.ip,
          key,
          current,
          max,
          url: req.originalUrl
        });
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message
          }
        });
      }
      
      // Set headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs)
      });
      
      next();
    } catch (error) {
      logger.error('Rate limit error:', error.message);
      // If Redis is down, allow the request to proceed
      next();
    }
  };
};

/**
 * Get rate limit status
 */
const getRateLimitStatus = async (key) => {
  try {
    const current = await cache.get(key);
    const ttl = await cache.ttl(key);
    
    return {
      current: current || 0,
      remaining: Math.max(0, defaultConfig.max - (current || 0)),
      resetTime: ttl > 0 ? new Date(Date.now() + ttl * 1000) : null
    };
  } catch (error) {
    logger.error('Get rate limit status error:', error.message);
    return null;
  }
};

/**
 * Clear rate limit for a key
 */
const clearRateLimit = async (key) => {
  try {
    await cache.del(key);
    return true;
  } catch (error) {
    logger.error('Clear rate limit error:', error.message);
    return false;
  }
};

/**
 * IP whitelist middleware
 */
const createIPWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Always allow localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.includes('localhost'))) {
      return next();
    }
    
    if (whitelist.includes(clientIP)) {
      return next();
    }
    
    // Apply rate limiting for non-whitelisted IPs
    return setupRateLimit()(req, res, next);
  };
};

/**
 * Adaptive rate limiting based on user behavior
 */
const adaptiveRateLimit = createCustomRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Base limit
  keyPrefix: 'adaptive_rate_limit',
  keyGenerator: (req) => {
    // Different limits for different user types
    if (req.user?.role === 'admin') return `admin:${req.user.id}`;
    if (req.user) return `user:${req.user.id}`;
    return `ip:${req.ip}`;
  }
});

module.exports = {
  setupRateLimit,
  strictRateLimit,
  apiRateLimit,
  publicRateLimit,
  uploadRateLimit,
  contactRateLimit,
  searchRateLimit,
  createCustomRateLimit,
  createIPWhitelist,
  adaptiveRateLimit,
  getRateLimitStatus,
  clearRateLimit
};

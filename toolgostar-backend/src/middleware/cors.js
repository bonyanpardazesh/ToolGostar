/**
 * CORS Middleware Configuration
 * Cross-Origin Resource Sharing setup
 */

const cors = require('cors');
const logger = require('../utils/logger');

/**
 * Get allowed origins from environment
 */
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(origin => origin.trim());
};

/**
 * CORS configuration options
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    logger.security('CORS blocked request', { origin, allowedOrigins });
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Session-ID',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: 86400 // 24 hours preflight cache
};

/**
 * Setup CORS middleware
 */
const setupCORS = () => {
  return cors(corsOptions);
};

/**
 * Custom CORS handler for specific routes
 */
const customCORS = (options = {}) => {
  const customOptions = {
    ...corsOptions,
    ...options
  };
  
  return cors(customOptions);
};

/**
 * Public API CORS (more permissive)
 */
const publicCORS = () => {
  return cors({
    ...corsOptions,
    origin: true, // Allow all origins for public endpoints
    credentials: false // No credentials for public endpoints
  });
};

/**
 * Admin API CORS (more restrictive)
 */
const adminCORS = () => {
  const adminOrigins = [
    process.env.ADMIN_URL,
    'http://localhost:3000', // Frontend dev server
    'http://localhost:3001', // Backend dev server
    'http://localhost:3002', // Admin panel dev server
    'https://toolgostar.com',
    'https://www.toolgostar.com',
    'https://toolgostar.com/toolgostar-admin',
    'https://admin.toolgostar.com'
  ].filter(Boolean);
  
  return cors({
    ...corsOptions,
    origin: (origin, callback) => {
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (adminOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      logger.security('Admin CORS blocked request', { origin, adminOrigins });
      return callback(new Error('Not allowed by Admin CORS'), false);
    }
  });
};

module.exports = {
  setupCORS,
  customCORS,
  publicCORS,
  adminCORS,
  corsOptions
};

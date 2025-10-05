/**
 * Error Handling Middleware
 * Global error handler for the application
 */

const logger = require('../utils/logger');

/**
 * Development error handler
 */
const developmentErrorHandler = (err, req, res, next) => {
  logger.error('Development Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      details: err.details || undefined,
      stack: err.stack // Include stack trace in development
    }
  };

  // Add request info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * Production error handler
 */
const productionErrorHandler = (err, req, res, next) => {
  logger.error('Production Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || err.status,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  const statusCode = err.statusCode || err.status || 500;
  
  // Don't expose internal errors in production
  let message = err.message;
  let code = err.code || 'INTERNAL_ERROR';
  
  // Sanitize error messages for production
  if (statusCode === 500 && !err.isOperational) {
    message = 'Internal server error';
    code = 'INTERNAL_ERROR';
  }

  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      details: err.details || undefined
    }
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle different types of errors
 */
const handleError = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || err.status || 500;
  err.isOperational = err.isOperational || false;

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    err.message = 'Validation failed';
    err.details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    err.isOperational = true;
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    err.statusCode = 409;
    err.code = 'DUPLICATE_ENTRY';
    err.message = 'Duplicate entry';
    err.details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    err.isOperational = true;
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    err.statusCode = 400;
    err.code = 'FOREIGN_KEY_CONSTRAINT';
    err.message = 'Referenced record does not exist';
    err.isOperational = true;
  }

  // Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeConnectionRefusedError') {
    err.statusCode = 503;
    err.code = 'DATABASE_CONNECTION_ERROR';
    err.message = 'Database connection failed';
    err.isOperational = true;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.code = 'INVALID_TOKEN';
    err.message = 'Invalid authentication token';
    err.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';
    err.message = 'Authentication token has expired';
    err.isOperational = true;
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 413;
    err.code = 'FILE_TOO_LARGE';
    err.message = 'File size exceeds the maximum allowed limit';
    err.isOperational = true;
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    err.statusCode = 413;
    err.code = 'TOO_MANY_FILES';
    err.message = 'Too many files uploaded';
    err.isOperational = true;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    err.statusCode = 400;
    err.code = 'UNEXPECTED_FILE';
    err.message = 'Unexpected file field';
    err.isOperational = true;
  }

  // MongoDB/Mongoose errors (if using MongoDB in future)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    err.message = 'Invalid ID format';
    err.isOperational = true;
  }

  // Express validation errors
  if (err.type === 'entity.parse.failed') {
    err.statusCode = 400;
    err.code = 'INVALID_JSON';
    err.message = 'Invalid JSON in request body';
    err.isOperational = true;
  }

  if (err.type === 'entity.too.large') {
    err.statusCode = 413;
    err.code = 'PAYLOAD_TOO_LARGE';
    err.message = 'Request payload too large';
    err.isOperational = true;
  }

  // Custom application errors
  if (err.name === 'AppError') {
    err.isOperational = true;
  }

  // Route to appropriate error handler
  if (process.env.NODE_ENV === 'development') {
    return developmentErrorHandler(err, req, res, next);
  } else {
    return productionErrorHandler(err, req, res, next);
  }
};

/**
 * Handle 404 errors (should be used before error handler)
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  error.isOperational = true;
  next(error);
};

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error helper
 */
const validationError = (message, details = null) => {
  return new AppError(message, 422, 'VALIDATION_ERROR', details);
};

/**
 * Not found error helper
 */
const notFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Unauthorized error helper
 */
const unauthorizedError = (message = 'Unauthorized') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden error helper
 */
const forbiddenError = (message = 'Forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Conflict error helper
 */
const conflictError = (message = 'Resource already exists') => {
  return new AppError(message, 409, 'CONFLICT');
};

/**
 * Bad request error helper
 */
const badRequestError = (message = 'Bad request', details = null) => {
  return new AppError(message, 400, 'BAD_REQUEST', details);
};

module.exports = {
  handleError,
  notFoundHandler,
  AppError,
  asyncHandler,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  conflictError,
  badRequestError
};

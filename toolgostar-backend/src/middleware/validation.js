/**
 * Validation Middleware
 * Request validation using Joi schemas
 */

const Joi = require('joi');
const { AppError } = require('./error');
const logger = require('../utils/logger');

/**
 * Middleware to validate request data against Joi schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    // Validate different parts of the request
    const validationSources = {
      body: req.body,
      query: req.query,
      params: req.params
    };

    const errors = [];

    Object.keys(schema).forEach(source => {
      if (validationSources[source] && schema[source]) {
        const { error } = schema[source].validate(validationSources[source], {
          abortEarly: false, // Collect all errors
          allowUnknown: false, // Don't allow unknown fields
          stripUnknown: true // Remove unknown fields
        });

        if (error) {
          // Log the detailed validation error to the console for debugging
          console.error('--- DETAILED VALIDATION ERROR ---');
          console.error(JSON.stringify(error.details, null, 2));
          console.error('--- END DETAILED VALIDATION ERROR ---');

          errors.push(...error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            source
          })));
        }
      }
    });

    if (errors.length > 0) {
      logger.warn('Validation errors', {
        errors,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { errors }
      );
    }

    next();
  };
};

/**
 * Common validation patterns
 */
const commonPatterns = {
  // ObjectId pattern (for MongoDB compatibility if needed)
  objectId: /^[0-9a-fA-F]{24}$/,
  
  // Slug pattern (URL-friendly string)
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // Phone number (international format)
  phone: /^\+?[\d\s\-\(\)]+$/,
  
  // Strong password
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  // URL pattern
  url: /^https?:\/\/.+/,
  
  // Image URL pattern
  imageUrl: /\.(jpg|jpeg|png|gif|webp)$/i,
  
  // Color hex code
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
};

/**
 * Common Joi schemas
 */
const commonSchemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Search
  search: Joi.object({
    q: Joi.string().min(2).max(100).required(),
    category: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(50).default(20)
  }),

  // ID parameter
  id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(commonPatterns.slug)
  ).required(),

  // Email
  email: Joi.string().email().lowercase().required(),

  // Password
  password: Joi.string().min(8).max(128).required(),

  // Strong password
  strongPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(commonPatterns.strongPassword)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),

  // Name fields
  name: Joi.string().min(2).max(50).trim().required(),
  optionalName: Joi.string().min(2).max(50).trim().optional(),

  // Phone number
  phone: Joi.string().pattern(commonPatterns.phone).optional(),

  // URL
  url: Joi.string().uri().optional(),

  // Image URL
  imageUrl: Joi.string().pattern(commonPatterns.url).pattern(commonPatterns.imageUrl).optional(),

  // Text fields
  shortText: Joi.string().max(255).trim(),
  mediumText: Joi.string().max(1000).trim(),
  longText: Joi.string().max(10000).trim(),

  // Slug
  slug: Joi.string().pattern(commonPatterns.slug).lowercase(),

  // Boolean
  boolean: Joi.boolean().optional(),

  // Date
  date: Joi.date().iso(),
  optionalDate: Joi.date().iso().optional(),

  // Arrays
  stringArray: Joi.array().items(Joi.string()),
  numberArray: Joi.array().items(Joi.number()),

  // File upload
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    buffer: Joi.binary().required()
  }).optional()
};

/**
 * Validation helper functions
 */
const validationHelpers = {
  /**
   * Create a schema for updating (all fields optional)
   */
  makeOptional: (schema) => {
    const optionalSchema = {};
    Object.keys(schema).forEach(key => {
      optionalSchema[key] = schema[key].optional();
    });
    return optionalSchema;
  },

  /**
   * Validate file upload
   */
  validateFile: (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      required = false
    } = options;

    if (!file && required) {
      throw new AppError('File is required', 400, 'FILE_REQUIRED');
    }

    if (file) {
      if (file.size > maxSize) {
        throw new AppError(`File size must be less than ${maxSize / 1024 / 1024}MB`, 400, 'FILE_TOO_LARGE');
      }

      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(`File type must be one of: ${allowedTypes.join(', ')}`, 400, 'INVALID_FILE_TYPE');
      }
    }

    return true;
  },

  /**
   * Validate array of IDs
   */
  validateIds: (ids, maxCount = 100) => {
    if (!Array.isArray(ids)) {
      throw new AppError('IDs must be an array', 400, 'INVALID_IDS');
    }

    if (ids.length > maxCount) {
      throw new AppError(`Maximum ${maxCount} IDs allowed`, 400, 'TOO_MANY_IDS');
    }

    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new AppError('Duplicate IDs not allowed', 400, 'DUPLICATE_IDS');
    }

    return true;
  },

  /**
   * Sanitize HTML content
   */
  sanitizeHtml: (html) => {
    // This is a basic implementation - in production, use a proper library like DOMPurify
    if (!html) return html;
    
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
};

/**
 * Custom Joi extensions
 */
const customJoi = Joi.extend({
  type: 'string',
  base: Joi.string(),
  rules: {
    htmlSafe: {
      method() {
        return this.$_addRule({ name: 'htmlSafe' });
      },
      validate(value, helpers) {
        const sanitized = validationHelpers.sanitizeHtml(value);
        if (sanitized !== value) {
          return helpers.error('string.htmlSafe');
        }
        return sanitized;
      }
    }
  },
  messages: {
    'string.htmlSafe': 'HTML content contains potentially unsafe elements'
  }
});

/**
 * Error formatter for consistent error responses
 */
const formatValidationError = (error) => {
  if (!error.details) return 'Validation error';

  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/['"]/g, ''),
    value: detail.context?.value
  }));
};

module.exports = {
  validateRequest,
  commonPatterns,
  commonSchemas,
  validationHelpers,
  customJoi,
  formatValidationError
};

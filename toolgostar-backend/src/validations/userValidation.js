/**
 * User Validation Schemas
 * Joi validation schemas for user management operations
 */

const Joi = require('joi');

const userSchemas = {
  create: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Must be a valid email address',
          'any.required': 'Email is required'
        }),
      
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'Password is required'
        }),
      
      firstName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 100 characters',
          'any.required': 'First name is required'
        }),
      
      lastName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 100 characters',
          'any.required': 'Last name is required'
        }),
      
      role: Joi.string()
        .valid('admin', 'editor')
        .default('editor')
        .messages({
          'any.only': 'Role must be either admin or editor'
        }),
      
      isActive: Joi.boolean()
        .default(true)
        .messages({
          'boolean.base': 'isActive must be a boolean value'
        })
    })
  },

  update: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .optional()
        .messages({
          'string.email': 'Must be a valid email address'
        }),
      
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .optional()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
      
      firstName: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name cannot exceed 100 characters'
        }),
      
      lastName: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name cannot exceed 100 characters'
        }),
      
      role: Joi.string()
        .valid('admin', 'editor')
        .optional()
        .messages({
          'any.only': 'Role must be either admin or editor'
        }),
      
      isActive: Joi.boolean()
        .optional()
        .messages({
          'boolean.base': 'isActive must be a boolean value'
        })
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  updateStatus: {
    body: Joi.object({
      isActive: Joi.boolean()
        .required()
        .messages({
          'boolean.base': 'isActive must be a boolean value',
          'any.required': 'isActive is required'
        })
    })
  },

  resetPassword: {
    body: Joi.object({
      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 128 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'any.required': 'New password is required'
        })
    })
  },

  query: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
          'number.base': 'Page must be a number',
          'number.integer': 'Page must be an integer',
          'number.min': 'Page must be at least 1'
        }),
      
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .messages({
          'number.base': 'Limit must be a number',
          'number.integer': 'Limit must be an integer',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        }),
      
      role: Joi.string()
        .valid('admin', 'editor')
        .optional()
        .messages({
          'any.only': 'Role must be either admin or editor'
        }),
      
      status: Joi.string()
        .valid('active', 'inactive')
        .optional()
        .messages({
          'any.only': 'Status must be either active or inactive'
        }),
      
      search: Joi.string()
        .min(1)
        .max(100)
        .optional()
        .messages({
          'string.min': 'Search term must be at least 1 character long',
          'string.max': 'Search term cannot exceed 100 characters'
        }),
      
      sortBy: Joi.string()
        .valid('firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'lastLoginAt')
        .default('createdAt')
        .messages({
          'any.only': 'Sort by must be one of: firstName, lastName, email, role, isActive, createdAt, lastLoginAt'
        }),
      
      sortOrder: Joi.string()
        .valid('ASC', 'DESC')
        .default('DESC')
        .messages({
          'any.only': 'Sort order must be ASC or DESC'
        })
    })
  }
};

module.exports = { userSchemas };

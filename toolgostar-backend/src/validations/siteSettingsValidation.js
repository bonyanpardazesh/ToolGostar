/**
 * Site Settings Validation Schemas
 * Joi validation schemas for site settings operations
 */

const Joi = require('joi');

const siteSettingsSchemas = {
  create: {
    body: Joi.object({
      key: Joi.string()
        .pattern(/^[a-z_]+$/)
        .min(1)
        .max(100)
        .required()
        .messages({
          'string.pattern.base': 'Setting key can only contain lowercase letters and underscores',
          'string.min': 'Setting key must be at least 1 character long',
          'string.max': 'Setting key cannot exceed 100 characters',
          'any.required': 'Setting key is required'
        }),
      
      value: Joi.any()
        .required()
        .messages({
          'any.required': 'Setting value is required'
        }),
      
      type: Joi.string()
        .valid('string', 'number', 'boolean', 'json')
        .default('string')
        .messages({
          'any.only': 'Setting type must be one of: string, number, boolean, json'
        }),
      
      category: Joi.string()
        .valid('general', 'company', 'contact', 'social', 'seo', 'analytics', 'email', 'stats')
        .default('general')
        .messages({
          'any.only': 'Category must be one of: general, company, contact, social, seo, analytics, email, stats'
        }),
      
      description: Joi.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Description cannot exceed 500 characters'
        })
    })
  },

  update: {
    body: Joi.object({
      value: Joi.any()
        .required()
        .messages({
          'any.required': 'Setting value is required'
        }),
      
      type: Joi.string()
        .valid('string', 'number', 'boolean', 'json')
        .optional()
        .messages({
          'any.only': 'Setting type must be one of: string, number, boolean, json'
        })
    })
  },

  bulkUpdate: {
    body: Joi.object({
      settings: Joi.array()
        .items(
          Joi.object({
            key: Joi.string()
              .pattern(/^[a-z_]+$/)
              .required()
              .messages({
                'string.pattern.base': 'Setting key can only contain lowercase letters and underscores',
                'any.required': 'Setting key is required'
              }),
            
            value: Joi.any()
              .required()
              .messages({
                'any.required': 'Setting value is required'
              }),
            
            type: Joi.string()
              .valid('string', 'number', 'boolean', 'json')
              .optional()
              .messages({
                'any.only': 'Setting type must be one of: string, number, boolean, json'
              })
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one setting must be provided',
          'any.required': 'Settings array is required'
        })
    })
  },

  import: {
    body: Joi.object({
      settings: Joi.array()
        .items(
          Joi.object({
            key: Joi.string()
              .pattern(/^[a-z_]+$/)
              .required()
              .messages({
                'string.pattern.base': 'Setting key can only contain lowercase letters and underscores',
                'any.required': 'Setting key is required'
              }),
            
            value: Joi.any()
              .required()
              .messages({
                'any.required': 'Setting value is required'
              }),
            
            type: Joi.string()
              .valid('string', 'number', 'boolean', 'json')
              .default('string')
              .messages({
                'any.only': 'Setting type must be one of: string, number, boolean, json'
              }),
            
            category: Joi.string()
              .valid('general', 'company', 'contact', 'social', 'seo', 'analytics', 'email', 'stats')
              .default('general')
              .messages({
                'any.only': 'Category must be one of: general, company, contact, social, seo, analytics, email, stats'
              }),
            
            description: Joi.string()
              .max(500)
              .optional()
              .allow('')
              .messages({
                'string.max': 'Description cannot exceed 500 characters'
              })
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': 'At least one setting must be provided',
          'any.required': 'Settings array is required'
        }),
      
      overwrite: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Overwrite must be a boolean value'
        })
    })
  },

  query: {
    query: Joi.object({
      category: Joi.string()
        .valid('general', 'company', 'contact', 'social', 'seo', 'analytics', 'email', 'stats')
        .optional()
        .messages({
          'any.only': 'Category must be one of: general, company, contact, social, seo, analytics, email, stats'
        })
    })
  }
};

module.exports = { siteSettingsSchemas };

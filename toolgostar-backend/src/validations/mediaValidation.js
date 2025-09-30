/**
 * Media Validation Schemas
 * Joi validation schemas for media-related operations
 */

const Joi = require('joi');

const mediaSchemas = {
  upload: {
    body: Joi.object({
      altText: Joi.string()
        .max(255)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Alt text cannot exceed 255 characters'
        }),
      
      caption: Joi.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Caption cannot exceed 500 characters'
        }),
      
      tags: Joi.string()
        .optional()
        .allow('')
        .messages({
          'string.base': 'Tags must be a string'
        }),
      
      usedInType: Joi.string()
        .valid('product', 'project', 'news', 'page')
        .optional()
        .messages({
          'any.only': 'Used in type must be one of: product, project, news, page'
        }),
      
      usedInId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
          'number.base': 'Used in ID must be a number',
          'number.integer': 'Used in ID must be an integer',
          'number.positive': 'Used in ID must be a positive number'
        })
    })
  },

  update: {
    body: Joi.object({
      altText: Joi.string()
        .max(255)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Alt text cannot exceed 255 characters'
        }),
      
      caption: Joi.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Caption cannot exceed 500 characters'
        }),
      
      tags: Joi.alternatives()
        .try(
          Joi.string().allow(''),
          Joi.array().items(Joi.string().min(1).max(50))
        )
        .optional()
        .messages({
          'alternatives.match': 'Tags must be a string or array of strings',
          'string.min': 'Each tag must be at least 1 character long',
          'string.max': 'Each tag cannot exceed 50 characters'
        }),
      
      usedInType: Joi.string()
        .valid('product', 'project', 'news', 'page')
        .optional()
        .messages({
          'any.only': 'Used in type must be one of: product, project, news, page'
        }),
      
      usedInId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
          'number.base': 'Used in ID must be a number',
          'number.integer': 'Used in ID must be an integer',
          'number.positive': 'Used in ID must be a positive number'
        })
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
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
      
      type: Joi.string()
        .valid('image', 'video', 'audio', 'document', 'other')
        .optional()
        .messages({
          'any.only': 'Type must be one of: image, video, audio, document, other'
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
        .valid('filename', 'originalName', 'fileSize', 'createdAt', 'updatedAt')
        .default('createdAt')
        .messages({
          'any.only': 'Sort by must be one of: filename, originalName, fileSize, createdAt, updatedAt'
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

module.exports = { mediaSchemas };

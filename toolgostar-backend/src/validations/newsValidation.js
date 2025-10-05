/**
 * News Validation Schemas
 * Joi validation schemas for news-related operations
 */

const Joi = require('joi');

// Schema for multilingual fields
const i18nString = Joi.object({
  en: Joi.string().required(),
  fa: Joi.string().allow('').optional()
});

const optionalI18nString = Joi.object({
  en: Joi.string().allow(''),
  fa: Joi.string().allow('')
});

const newsSchemas = {
  create: {
    body: Joi.object({
      title: i18nString,
      
      slug: Joi.string()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(255)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
          'string.min': 'Slug must be at least 2 characters long',
          'string.max': 'Slug cannot exceed 255 characters'
        }),
      
      excerpt: optionalI18nString.optional(),
      
      content: i18nString
        .messages({
          'any.required': 'Article content is required'
        }),
      
      categoryId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'Category ID must be a number',
          'number.integer': 'Category ID must be an integer',
          'number.positive': 'Category ID must be a positive number',
          'any.required': 'Article category is required'
        }),
      
      featuredImage: Joi.string()
        .uri()
        .allow('')
        .optional()
        .allow('')
        .messages({
          'string.uri': 'Featured image must be a valid URL'
        }),
      
      galleryImages: Joi.array()
        .items(Joi.string().uri())
        .allow('')
        .optional()
        .messages({
          'array.base': 'Gallery images must be an array',
          'string.uri': 'Each gallery image must be a valid URL'
        }),
      
      metaTitle: Joi.string()
        .max(60)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Meta title cannot exceed 60 characters'
        }),
      
      metaDescription: Joi.string()
        .max(160)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Meta description cannot exceed 160 characters'
        }),
      
      tags: Joi.array()
        .items(Joi.string().min(1).max(50))
        .allow('')
        .optional()
        .messages({
          'array.base': 'Tags must be an array',
          'string.min': 'Each tag must be at least 1 character long',
          'string.max': 'Each tag cannot exceed 50 characters'
        }),
      
      status: Joi.string()
        .valid('draft', 'published', 'archived')
        .default('draft')
        .messages({
          'any.only': 'Status must be one of: draft, published, archived'
        }),
      
      isFeatured: Joi.boolean()
        .default(false)
        .messages({
          'boolean.base': 'Featured flag must be a boolean value'
        })
    })
  },

  update: {
    body: Joi.object({
      title: i18nString.optional(),
      
      slug: Joi.string()
        .pattern(/^[a-z0-9-]+$/)
        .min(2)
        .max(255)
        .allow('')
        .optional()
        .messages({
          'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
          'string.min': 'Slug must be at least 2 characters long',
          'string.max': 'Slug cannot exceed 255 characters'
        }),
      
      excerpt: optionalI18nString.optional(),
      
      content: i18nString.optional(),
      
      categoryId: Joi.number()
        .integer()
        .positive()
        .allow('')
        .optional()
        .messages({
          'number.base': 'Category ID must be a number',
          'number.integer': 'Category ID must be an integer',
          'number.positive': 'Category ID must be a positive number'
        }),
      
      featuredImage: Joi.string()
        .uri()
        .allow('')
        .optional()
        .allow('')
        .messages({
          'string.uri': 'Featured image must be a valid URL'
        }),
      
      galleryImages: Joi.array()
        .items(Joi.string().uri())
        .allow('')
        .optional()
        .messages({
          'array.base': 'Gallery images must be an array',
          'string.uri': 'Each gallery image must be a valid URL'
        }),
      
      metaTitle: Joi.string()
        .max(60)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Meta title cannot exceed 60 characters'
        }),
      
      metaDescription: Joi.string()
        .max(160)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Meta description cannot exceed 160 characters'
        }),
      
      tags: Joi.array()
        .items(Joi.string().min(1).max(50))
        .allow('')
        .optional()
        .messages({
          'array.base': 'Tags must be an array',
          'string.min': 'Each tag must be at least 1 character long',
          'string.max': 'Each tag cannot exceed 50 characters'
        }),
      
      status: Joi.string()
        .valid('draft', 'published', 'archived')
        .allow('')
        .optional()
        .messages({
          'any.only': 'Status must be one of: draft, published, archived'
        }),
      
      isFeatured: Joi.boolean()
        .allow('')
        .optional()
        .messages({
          'boolean.base': 'Featured flag must be a boolean value'
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
        .default(10)
        .messages({
          'number.base': 'Limit must be a number',
          'number.integer': 'Limit must be an integer',
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 100'
        }),
      
      status: Joi.string()
        .valid('draft', 'published', 'archived')
        .allow('')
        .optional()
        .messages({
          'any.only': 'Status must be one of: draft, published, archived'
        }),
      
      category: Joi.number()
        .integer()
        .positive()
        .allow('')
        .optional()
        .messages({
          'number.base': 'Category must be a number',
          'number.integer': 'Category must be an integer',
          'number.positive': 'Category must be a positive number'
        }),
      
      search: Joi.string()
        .min(1)
        .max(100)
        .allow('')
        .optional()
        .messages({
          'string.min': 'Search term must be at least 1 character long',
          'string.max': 'Search term cannot exceed 100 characters'
        }),
      
      sortBy: Joi.string()
        .valid('title', 'createdAt', 'updatedAt', 'publishedAt', 'viewsCount')
        .default('publishedAt')
        .messages({
          'any.only': 'Sort by must be one of: title, createdAt, updatedAt, publishedAt, viewsCount'
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

module.exports = { newsSchemas };

/**
 * Quote Validation Schemas
 * Joi validation schemas for quote-related operations
 */

const Joi = require('joi');

const quoteSchemas = {
  update: {
    body: Joi.object({
      products: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
          'array.base': 'Products must be an array',
          'number.base': 'Product ID must be a number',
          'number.integer': 'Product ID must be an integer',
          'number.positive': 'Product ID must be positive'
        }),
      
      productCategories: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
          'array.base': 'Product categories must be an array',
          'number.base': 'Category ID must be a number',
          'number.integer': 'Category ID must be an integer',
          'number.positive': 'Category ID must be positive'
        }),
      
      industry: Joi.string()
        .max(100)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Industry cannot exceed 100 characters'
        }),
      
      applicationArea: Joi.string()
        .valid('industrial_process', 'municipal_water', 'wastewater_treatment', 'food_beverage', 'pharmaceutical', 'power_generation', 'mining', 'other')
        .optional()
        .messages({
          'any.only': 'Application area must be one of: industrial_process, municipal_water, wastewater_treatment, food_beverage, pharmaceutical, power_generation, mining, other'
        }),
      
      requiredCapacity: Joi.string()
        .max(100)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Required capacity cannot exceed 100 characters'
        }),
      
      budget: Joi.number()
        .positive()
        .optional()
        .messages({
          'number.base': 'Budget must be a number',
          'number.positive': 'Budget must be positive'
        }),
      
      timeline: Joi.string()
        .max(100)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Timeline cannot exceed 100 characters'
        }),
      
      requirements: Joi.object()
        .optional()
        .messages({
          'object.base': 'Requirements must be an object'
        }),
      
      notes: Joi.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Notes cannot exceed 1000 characters'
        }),
      
      quoteAmount: Joi.number()
        .positive()
        .optional()
        .messages({
          'number.base': 'Quote amount must be a number',
          'number.positive': 'Quote amount must be positive'
        }),
      
      status: Joi.string()
        .valid('pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled')
        .optional()
        .messages({
          'any.only': 'Status must be one of: pending, in_progress, quoted, approved, rejected, cancelled'
        }),
      
      assignedTo: Joi.number()
        .integer()
        .positive()
        .optional()
        .allow(null)
        .messages({
          'number.base': 'Assigned to must be a number',
          'number.integer': 'Assigned to must be an integer',
          'number.positive': 'Assigned to must be positive'
        })
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  updateStatus: {
    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled')
        .required()
        .messages({
          'any.required': 'Status is required',
          'any.only': 'Status must be one of: pending, in_progress, quoted, approved, rejected, cancelled'
        }),
      
      notes: Joi.string()
        .max(1000)
        .optional()
        .allow('')
        .messages({
          'string.max': 'Notes cannot exceed 1000 characters'
        })
    })
  },

  assign: {
    body: Joi.object({
      assignedTo: Joi.number()
        .integer()
        .positive()
        .optional()
        .allow(null)
        .messages({
          'number.base': 'Assigned to must be a number',
          'number.integer': 'Assigned to must be an integer',
          'number.positive': 'Assigned to must be positive'
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
      
      status: Joi.string()
        .valid('pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled')
        .optional()
        .messages({
          'any.only': 'Status must be one of: pending, in_progress, quoted, approved, rejected, cancelled'
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
        .valid('quoteNumber', 'status', 'quoteAmount', 'createdAt', 'updatedAt')
        .default('createdAt')
        .messages({
          'any.only': 'Sort by must be one of: quoteNumber, status, quoteAmount, createdAt, updatedAt'
        }),
      
      sortOrder: Joi.string()
        .valid('ASC', 'DESC')
        .default('DESC')
        .messages({
          'any.only': 'Sort order must be ASC or DESC'
        }),
      
      dateFrom: Joi.date()
        .iso()
        .optional()
        .messages({
          'date.format': 'Date from must be a valid ISO date'
        }),
      
      dateTo: Joi.date()
        .iso()
        .min(Joi.ref('dateFrom'))
        .optional()
        .messages({
          'date.format': 'Date to must be a valid ISO date',
          'date.min': 'Date to must be after date from'
        })
    })
  }
};

module.exports = { quoteSchemas };

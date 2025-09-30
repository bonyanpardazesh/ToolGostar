/**
 * Product Validation Schemas
 */

const Joi = require('joi');
const { commonSchemas } = require('../middleware/validation');

const productSchemas = {
  // Create product validation
  create: {
    body: Joi.object({
      name: Joi.alternatives().try(
        Joi.string().min(2).max(50).trim(),
        Joi.object({
          en: Joi.string().min(2).max(50).trim().required(),
          fa: Joi.string().min(2).max(50).trim().optional()
        }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.en && parsed.en.length > 50) {
                return helpers.error('string.max', { limit: 50 });
              }
              if (parsed.fa && parsed.fa.length > 50) {
                return helpers.error('string.max', { limit: 50 });
              }
              return parsed;
            }
          } catch (e) {
            // If it's not valid JSON, treat as regular string
          }
          return value;
        })
      ).required(),
      slug: commonSchemas.slug.optional(),
      shortDescription: Joi.alternatives().try(
        Joi.string().max(255).trim().allow(''),
        Joi.object({
          en: Joi.string().max(255).trim().optional(),
          fa: Joi.string().max(255).trim().optional()
        }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.en && parsed.en.length > 255) {
                return helpers.error('string.max', { limit: 255 });
              }
              if (parsed.fa && parsed.fa.length > 255) {
                return helpers.error('string.max', { limit: 255 });
              }
              return parsed;
            }
          } catch (e) {
            // If it's not valid JSON, treat as regular string
          }
          return value;
        })
      ).optional(),
      fullDescription: commonSchemas.longText.optional(),
      categoryId: Joi.number().integer().positive().required(),
      icon: Joi.string().max(100).allow('').optional(),
      specifications: Joi.alternatives().try(
        Joi.object(),
        Joi.string().allow('')
      ).optional(),
      features: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow(''),
        Joi.object({
          en: Joi.array().items(Joi.string()).optional(),
          fa: Joi.array().items(Joi.string()).optional()
        })
      ).optional(),
      applications: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow(''),
        Joi.object({
          en: Joi.array().items(Joi.string()).optional(),
          fa: Joi.array().items(Joi.string()).optional()
        })
      ).optional(),
      imageUrls: Joi.array().items(commonSchemas.imageUrl).optional(),
      catalogEnUrl: commonSchemas.url.optional(),
      catalogFaUrl: commonSchemas.url.optional(),
      featured: commonSchemas.boolean,
      isActive: commonSchemas.boolean,
      sortOrder: Joi.number().integer().min(0).optional(),
      metaTitle: Joi.string().max(60).optional(),
      metaDescription: Joi.string().max(160).optional(),
      metaKeywords: commonSchemas.stringArray.optional()
    })
  },

  // Update product validation
  update: {
    body: Joi.object({
      name: Joi.alternatives().try(
        Joi.string().min(2).max(50).trim(),
        Joi.object({
          en: Joi.string().min(2).max(50).trim().required(),
          fa: Joi.string().min(2).max(50).trim().optional()
        }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.en && parsed.en.length > 50) {
                return helpers.error('string.max', { limit: 50 });
              }
              if (parsed.fa && parsed.fa.length > 50) {
                return helpers.error('string.max', { limit: 50 });
              }
              return parsed;
            }
          } catch (e) {
            // If it's not valid JSON, treat as regular string
          }
          return value;
        })
      ).optional(),
      slug: commonSchemas.slug.optional(),
      shortDescription: Joi.alternatives().try(
        Joi.string().max(255).trim().allow(''),
        Joi.object({
          en: Joi.string().max(255).trim().optional(),
          fa: Joi.string().max(255).trim().optional()
        }),
        Joi.string().custom((value, helpers) => {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.en && parsed.en.length > 255) {
                return helpers.error('string.max', { limit: 255 });
              }
              if (parsed.fa && parsed.fa.length > 255) {
                return helpers.error('string.max', { limit: 255 });
              }
              return parsed;
            }
          } catch (e) {
            // If it's not valid JSON, treat as regular string
          }
          return value;
        })
      ).optional(),
      fullDescription: commonSchemas.longText.optional(),
      categoryId: Joi.number().integer().positive().optional(),
      icon: Joi.string().max(100).allow('').optional(),
      specifications: Joi.alternatives().try(
        Joi.object(),
        Joi.string().allow('')
      ).optional(),
      features: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow(''),
        Joi.object({
          en: Joi.array().items(Joi.string()).optional(),
          fa: Joi.array().items(Joi.string()).optional()
        })
      ).optional(),
      applications: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow(''),
        Joi.object({
          en: Joi.array().items(Joi.string()).optional(),
          fa: Joi.array().items(Joi.string()).optional()
        })
      ).optional(),
      imageUrls: Joi.array().items(commonSchemas.imageUrl).optional(),
      catalogEnUrl: commonSchemas.url.optional(),
      catalogFaUrl: commonSchemas.url.optional(),
      featured: commonSchemas.boolean,
      isActive: commonSchemas.boolean,
      sortOrder: Joi.number().integer().min(0).optional(),
      metaTitle: Joi.string().max(60).optional(),
      metaDescription: Joi.string().max(160).optional(),
      metaKeywords: commonSchemas.stringArray.optional()
    }).min(1)
  }
};

module.exports = {
  productSchemas
};

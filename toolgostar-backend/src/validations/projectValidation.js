/**
 * Project Validation Schemas
 */

const Joi = require('joi');
const { commonSchemas } = require('../middleware/validation');

// Schema for multilingual fields
const i18nString = Joi.object({
  en: Joi.string().required(),
  fa: Joi.string().allow('').optional()
});

const optionalI18nString = Joi.object({
  en: Joi.string().allow(''),
  fa: Joi.string().allow('')
});

const projectSchemas = {
  // Create project validation
  create: {
    body: Joi.object({
      title: i18nString,
      slug: commonSchemas.slug.optional(),
      description: optionalI18nString.optional(),
      categoryId: Joi.number().integer().positive().required(),
      location: Joi.string().max(200).required(),
      clientName: Joi.string().max(100).optional(),
      projectValue: Joi.number().min(0).optional(),
      capacity: Joi.string().max(100).optional(),
      completionDate: commonSchemas.optionalDate,
      startDate: commonSchemas.optionalDate,
      status: Joi.string().valid('planned', 'ongoing', 'completed', 'on_hold').default('planned'),
      progress: Joi.number().min(0).max(100).default(0),
      imageUrls: Joi.array().items(commonSchemas.imageUrl).optional(),
      thumbnailUrl: commonSchemas.imageUrl,
      equipmentUsed: commonSchemas.stringArray.optional(),
      challenges: commonSchemas.longText.optional(),
      solutions: commonSchemas.longText.optional(),
      results: commonSchemas.longText.optional(),
      testimonial: Joi.object({
        text: commonSchemas.longText.required(),
        author: Joi.string().max(100).required(),
        position: Joi.string().max(100).optional(),
        company: Joi.string().max(100).optional(),
        avatar: commonSchemas.imageUrl
      }).optional(),
      technicalSpecs: Joi.object().optional(),
      isFeatured: commonSchemas.boolean,
      isPublic: commonSchemas.boolean,
      sortOrder: Joi.number().integer().min(0).optional(),
      metaTitle: Joi.string().max(60).optional(),
      metaDescription: Joi.string().max(160).optional(),
      metaKeywords: commonSchemas.stringArray.optional()
    })
  },

  // Update project validation
  update: {
    body: Joi.object({
      title: i18nString.optional(),
      slug: commonSchemas.slug.optional(),
      description: optionalI18nString.optional(),
      categoryId: Joi.number().integer().positive().optional(),
      location: Joi.string().max(200).optional(),
      clientName: Joi.string().max(100).optional(),
      projectValue: Joi.number().min(0).optional(),
      capacity: Joi.string().max(100).optional(),
      completionDate: commonSchemas.optionalDate,
      startDate: commonSchemas.optionalDate,
      status: Joi.string().valid('planned', 'ongoing', 'completed', 'on_hold').optional(),
      progress: Joi.number().min(0).max(100).optional(),
      imageUrls: Joi.array().items(commonSchemas.imageUrl).optional(),
      thumbnailUrl: commonSchemas.imageUrl,
      equipmentUsed: commonSchemas.stringArray.optional(),
      challenges: commonSchemas.longText.optional(),
      solutions: commonSchemas.longText.optional(),
      results: commonSchemas.longText.optional(),
      testimonial: Joi.object({
        text: commonSchemas.longText.required(),
        author: Joi.string().max(100).required(),
        position: Joi.string().max(100).optional(),
        company: Joi.string().max(100).optional(),
        avatar: commonSchemas.imageUrl
      }).optional(),
      technicalSpecs: Joi.object().optional(),
      isFeatured: commonSchemas.boolean,
      isPublic: commonSchemas.boolean,
      sortOrder: Joi.number().integer().min(0).optional(),
      metaTitle: Joi.string().max(60).optional(),
      metaDescription: Joi.string().max(160).optional(),
      metaKeywords: commonSchemas.stringArray.optional()
    }).min(1)
  }
};

module.exports = {
  projectSchemas
};

/**
 * Contact Validation Schemas
 */

const Joi = require('joi');
const { commonSchemas } = require('../middleware/validation');

const contactSchemas = {
  // Contact form submission validation
  submit: {
    body: Joi.object({
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      email: commonSchemas.email,
      phone: commonSchemas.phone,
      company: Joi.string().max(100).optional(),
      industry: Joi.string().valid(
        'manufacturing',
        'chemical',
        'pharmaceutical',
        'food-beverage',
        'oil-gas',
        'mining',
        'municipal',
        'agriculture',
        'textile',
        'paper-pulp',
        'power-generation',
        'other'
      ).optional(),
      projectType: Joi.string().valid(
        'new-installation',
        'upgrade',
        'maintenance',
        'consultation',
        'spare-parts'
      ).optional(),
      subject: commonSchemas.shortText.required(),
      message: commonSchemas.longText.required(),
      urgency: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
      preferredContactMethod: Joi.string().valid('email', 'phone', 'sms', 'whatsapp', 'both').default('email'),
      source: Joi.string().valid(
        'website',
        'google_search',
        'social_media',
        'referral',
        'trade_show',
        'advertisement',
        'direct_mail',
        'other'
      ).default('website'),
      capacity: Joi.string().max(100).optional(),
      budget: Joi.string().valid(
        'under_10k',
        '10k_50k',
        '50k_100k',
        '100k_500k',
        '500k_1m',
        'over_1m',
        'not_specified'
      ).optional().allow(''),
      timeline: Joi.string().valid(
        'immediate',
        'within_month',
        'within_quarter',
        'within_6_months',
        'within_year',
        'not_specified',
        'asap',
        '1_month',
        '3_months',
        '6_months',
        '1_year',
        'flexible'
      ).optional().allow(''),
      gdprConsent: Joi.boolean().valid(true).required().messages({
        'any.only': 'GDPR consent is required'
      }),
      marketingConsent: Joi.boolean().default(false),
      // Tracking fields
      pageUrl: Joi.string().uri().optional(),
      referrerUrl: Joi.string().uri().optional(),
      sessionId: Joi.string().optional(),
      timeOnPage: Joi.number().min(0).optional(),
      formCompletionTime: Joi.number().min(0).optional(),
      utmSource: Joi.string().optional(),
      utmMedium: Joi.string().optional(),
      utmCampaign: Joi.string().optional(),
      utmTerm: Joi.string().optional(),
      utmContent: Joi.string().optional()
    })
  },

  // Quote request validation
  quote: {
    body: Joi.object({
      // Contact information
      contactInfo: Joi.object({
        firstName: commonSchemas.name,
        lastName: commonSchemas.name,
        email: commonSchemas.email,
        phone: commonSchemas.phone,
        company: Joi.string().max(100).required(),
        jobTitle: Joi.string().max(100).optional(),
        industry: Joi.string().valid(
          'manufacturing',
          'chemical',
          'pharmaceutical',
          'food_beverage',
          'oil_gas',
          'mining',
          'municipal',
          'agriculture',
          'textile',
          'paper_pulp',
          'power_generation',
          'other'
        ).required(),
        address: Joi.object({
          street: Joi.string().max(255).required(),
          city: Joi.string().max(100).required(),
          state: Joi.string().max(100).optional(),
          country: Joi.string().max(100).required(),
          postalCode: Joi.string().max(20).allow('').optional()
        }).required()
      }).required(),

      // Project details
      projectDetails: Joi.object({
        projectName: Joi.string().max(200).optional(),
        projectType: Joi.string().valid(
          'new-installation',
          'upgrade',
          'replacement',
          'expansion',
          'maintenance',
          'consultation',
          'spare-parts',
          'other'
        ).required(),
        applicationArea: Joi.string().valid(
          'drinking_water',
          'wastewater',
          'industrial_process',
          'swimming_pool',
          'cooling_tower',
          'boiler_feedwater',
          'other'
        ).required(),
        requiredCapacity: Joi.string().max(100).required(),
        flowRate: Joi.object({
          value: Joi.number().min(0).required(),
          unit: Joi.string().valid('lph', 'gpm', 'm3h', 'mgd').required()
        }).optional(),
        pressure: Joi.object({
          value: Joi.number().min(0).optional(),
          unit: Joi.string().valid('bar', 'psi', 'kpa').optional()
        }).optional(),
        temperature: Joi.object({
          min: Joi.number().optional(),
          max: Joi.number().optional(),
          unit: Joi.string().valid('celsius', 'fahrenheit').default('celsius')
        }).optional(),
        waterQuality: Joi.object({
          tds: Joi.number().min(0).optional(),
          ph: Joi.number().min(0).max(14).optional(),
          turbidity: Joi.number().min(0).optional(),
          hardness: Joi.number().min(0).optional(),
          chlorine: Joi.number().min(0).optional(),
          iron: Joi.number().min(0).optional(),
          otherContaminants: Joi.string().max(500).optional()
        }).optional(),
        siteConditions: Joi.object({
          location: Joi.string().valid('indoor', 'outdoor', 'both').optional(),
          powerSupply: Joi.string().valid('single_phase', 'three_phase', 'dc', 'solar').optional(),
          spaceConstraints: Joi.string().max(500).optional(),
          accessLimitations: Joi.string().max(500).optional(),
          environmentalFactors: Joi.string().max(500).optional()
        }).optional(),
        timeline: Joi.string().valid(
          'immediate',
          'within_month',
          'within_quarter',
          'within_6_months',
          'within_year'
        ).required(),
        budget: Joi.string().valid(
          'under_10k',
          '10k_50k',
          '50k_100k',
          '100k_500k',
          '500k_1m',
          'over_1m'
        ).required(),
        additionalRequirements: commonSchemas.longText.optional(),
        attachments: Joi.array().items(Joi.string()).optional()
      }).required(),

      // Additional options
      servicesRequired: Joi.array().items(
        Joi.string().valid(
          'design',
          'installation',
          'commissioning',
          'training',
          'maintenance',
          'monitoring',
          'consulting'
        )
      ).optional(),
      certificationRequirements: Joi.array().items(
        Joi.string().valid(
          'iso_9001',
          'iso_14001',
          'nsf',
          'ce_marking',
          'ul_listed',
          'wqa',
          'other'
        )
      ).optional(),
      warrantyRequirements: Joi.string().max(500).optional(),
      specialRequirements: commonSchemas.longText.optional(),

      // Consent and tracking
      gdprConsent: Joi.boolean().valid(true).required(),
      marketingConsent: Joi.boolean().default(false),
      pageUrl: Joi.string().uri().optional(),
      referrerUrl: Joi.string().uri().optional(),
      sessionId: Joi.string().optional(),
      timeOnPage: Joi.number().min(0).optional(),
      formCompletionTime: Joi.number().min(0).optional()
    })
  },

  // Update contact status validation (admin)
  updateStatus: {
    body: Joi.object({
      status: Joi.string().valid('new', 'in_progress', 'replied', 'closed').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      assignedTo: Joi.number().integer().positive().optional(),
      internalNotes: commonSchemas.longText.optional(),
      tags: Joi.array().items(Joi.string().max(50)).optional(),
      followUpDate: commonSchemas.optionalDate,
      estimatedValue: Joi.number().min(0).optional(),
      conversionProbability: Joi.number().min(0).max(100).optional()
    }).min(1)
  },

  // Add internal note validation (admin)
  addNote: {
    body: Joi.object({
      note: commonSchemas.longText.required(),
      isPublic: Joi.boolean().default(false),
      noteType: Joi.string().valid('general', 'call', 'email', 'meeting', 'followup').default('general')
    })
  },

  // Contact export validation (admin)
  export: {
    query: Joi.object({
      format: Joi.string().valid('csv', 'excel', 'json').default('csv'),
      status: Joi.string().valid('new', 'in_progress', 'replied', 'closed').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      assignedTo: Joi.number().integer().positive().optional(),
      dateFrom: commonSchemas.optionalDate,
      dateTo: commonSchemas.optionalDate,
      includeNotes: Joi.boolean().default(false),
      includeAnalytics: Joi.boolean().default(false)
    })
  },

  // Search contacts validation (admin)
  search: {
    query: Joi.object({
      q: Joi.string().min(2).max(100).required(),
      status: Joi.string().valid('new', 'in_progress', 'replied', 'closed').optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      industry: Joi.string().optional(),
      dateFrom: commonSchemas.optionalDate,
      dateTo: commonSchemas.optionalDate,
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  // Newsletter subscription validation
  subscribe: {
    body: Joi.object({
      email: commonSchemas.email,
      firstName: commonSchemas.optionalName,
      lastName: commonSchemas.optionalName,
      company: Joi.string().max(100).optional(),
      industry: Joi.string().optional(),
      interests: Joi.array().items(
        Joi.string().valid(
          'water_treatment',
          'wastewater_treatment',
          'industrial_solutions',
          'case_studies',
          'technical_articles',
          'product_updates',
          'industry_news'
        )
      ).optional(),
      gdprConsent: Joi.boolean().valid(true).required(),
      source: Joi.string().optional()
    })
  },

  // Unsubscribe validation
  unsubscribe: {
    body: Joi.object({
      email: commonSchemas.email,
      token: Joi.string().optional(),
      reason: Joi.string().valid(
        'too_frequent',
        'not_relevant',
        'changed_email',
        'company_policy',
        'other'
      ).optional(),
      feedback: commonSchemas.mediumText.optional()
    })
  },

  // Callback request validation
  callbackRequest: {
    body: Joi.object({
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      phone: commonSchemas.phone,
      email: commonSchemas.email,
      company: Joi.string().max(100).optional(),
      preferredTime: Joi.string().valid(
        'morning',
        'afternoon',
        'evening',
        'anytime'
      ).default('anytime'),
      timezone: Joi.string().optional(),
      urgency: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
      topic: commonSchemas.shortText.required(),
      additionalInfo: commonSchemas.mediumText.optional(),
      gdprConsent: Joi.boolean().valid(true).required()
    })
  }
};

module.exports = {
  contactSchemas
};

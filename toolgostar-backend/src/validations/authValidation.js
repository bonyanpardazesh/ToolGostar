/**
 * Authentication Validation Schemas
 */

const Joi = require('joi');
const { commonSchemas } = require('../middleware/validation');

const authSchemas = {
  // Login validation
  login: {
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      rememberMe: Joi.boolean().optional()
    })
  },

  // Update profile validation
  updateProfile: {
    body: Joi.object({
      firstName: commonSchemas.optionalName,
      lastName: commonSchemas.optionalName,
      email: commonSchemas.email.optional(),
      phoneNumber: commonSchemas.phone,
      jobTitle: Joi.string().max(100).optional(),
      department: Joi.string().max(100).optional(),
      bio: commonSchemas.mediumText.optional(),
      avatar: commonSchemas.imageUrl,
      preferences: Joi.object({
        language: Joi.string().valid('en', 'fa').default('en'),
        timezone: Joi.string().optional(),
        emailNotifications: Joi.boolean().default(true),
        smsNotifications: Joi.boolean().default(false),
        theme: Joi.string().valid('light', 'dark', 'auto').default('light')
      }).optional()
    }).min(1) // At least one field must be provided
  },

  // Change password validation
  changePassword: {
    body: Joi.object({
      currentPassword: commonSchemas.password,
      newPassword: commonSchemas.strongPassword,
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'Confirm password must match new password'
        })
    })
  },

  // Register validation (for admin creating users)
  register: {
    body: Joi.object({
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      email: commonSchemas.email,
      password: commonSchemas.strongPassword,
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Confirm password must match password'
        }),
      role: Joi.string().valid('admin', 'editor', 'viewer').default('viewer'),
      phoneNumber: commonSchemas.phone,
      jobTitle: Joi.string().max(100).optional(),
      department: Joi.string().max(100).optional(),
      isActive: Joi.boolean().default(true)
    })
  },

  // Forgot password validation
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email
    })
  },

  // Reset password validation
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      newPassword: commonSchemas.strongPassword,
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': 'Confirm password must match new password'
        })
    })
  },

  // Verify email validation
  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required()
    })
  },

  // Resend verification email
  resendVerification: {
    body: Joi.object({
      email: commonSchemas.email
    })
  },

  // API key validation
  apiKey: {
    headers: Joi.object({
      'x-api-key': Joi.string().required()
    }).unknown(true)
  },

  // Two-factor authentication setup
  setup2FA: {
    body: Joi.object({
      secret: Joi.string().required(),
      token: Joi.string().length(6).pattern(/^\d+$/).required()
    })
  },

  // Two-factor authentication verification
  verify2FA: {
    body: Joi.object({
      token: Joi.string().length(6).pattern(/^\d+$/).required(),
      trustDevice: Joi.boolean().default(false)
    })
  },

  // Disable two-factor authentication
  disable2FA: {
    body: Joi.object({
      password: commonSchemas.password,
      token: Joi.string().length(6).pattern(/^\d+$/).required()
    })
  },

  // Social login validation
  socialLogin: {
    body: Joi.object({
      provider: Joi.string().valid('google', 'linkedin', 'github').required(),
      accessToken: Joi.string().required(),
      idToken: Joi.string().optional(),
      redirectUri: Joi.string().uri().optional()
    })
  },

  // Impersonate user validation (admin only)
  impersonate: {
    body: Joi.object({
      userId: Joi.number().integer().positive().required(),
      reason: Joi.string().max(500).required()
    })
  },

  // Session management
  revokeSessions: {
    body: Joi.object({
      sessionIds: Joi.array().items(Joi.string()).optional(),
      revokeAll: Joi.boolean().default(false)
    })
  },

  // Device management
  registerDevice: {
    body: Joi.object({
      deviceName: Joi.string().max(100).required(),
      deviceType: Joi.string().valid('mobile', 'tablet', 'desktop', 'other').required(),
      deviceId: Joi.string().max(255).required(),
      pushToken: Joi.string().optional(),
      platform: Joi.string().valid('ios', 'android', 'web', 'windows', 'macos', 'linux').optional(),
      appVersion: Joi.string().max(50).optional()
    })
  },

  // Update device
  updateDevice: {
    params: Joi.object({
      deviceId: Joi.string().required()
    }),
    body: Joi.object({
      deviceName: Joi.string().max(100).optional(),
      pushToken: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      lastUsed: Joi.date().iso().optional()
    }).min(1)
  },

  // Login attempt validation
  loginAttempt: {
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      deviceInfo: Joi.object({
        userAgent: Joi.string().optional(),
        ipAddress: Joi.string().ip().optional(),
        deviceType: Joi.string().optional(),
        platform: Joi.string().optional(),
        location: Joi.object({
          country: Joi.string().optional(),
          city: Joi.string().optional(),
          timezone: Joi.string().optional()
        }).optional()
      }).optional(),
      captchaToken: Joi.string().optional() // For reCAPTCHA verification
    })
  }
};

module.exports = {
  authSchemas
};

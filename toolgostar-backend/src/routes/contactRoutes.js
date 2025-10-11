/**
 * Contact Routes
 * /api/v1/contact
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, requireAdmin, requireEditor, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { contactSchemas } = require('../validations/contactValidation');
const rateLimit = require('express-rate-limit');

// Rate limiting for contact forms
const contactRateLimit = rateLimit({
  windowMs: parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX) || 5, // Limit each IP to 5 contact submissions per hour
  message: {
    error: 'Too many contact form submissions',
    message: 'Please try again in an hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development if DEBUG is true
    return process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true';
  }
});

const quoteRateLimit = rateLimit({
  windowMs: parseInt(process.env.QUOTE_RATE_LIMIT_WINDOW_MS) || 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.QUOTE_RATE_LIMIT_MAX) || 2, // Limit each IP to 2 quote requests per day
  message: {
    error: 'Too many quote requests',
    message: 'Please try again tomorrow.',
    retryAfter: 86400
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development if DEBUG is true
    return process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true';
  }
});

/**
 * @route   POST /api/v1/contact/submit
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/submit',
  contactRateLimit,
  validateRequest(contactSchemas.submit),
  contactController.submitContact
);

/**
 * @route   POST /api/v1/contact/quote
 * @desc    Submit quote request
 * @access  Public
 */
router.post('/quote',
  quoteRateLimit,
  validateRequest(contactSchemas.quote),
  contactController.submitQuoteRequest
);

/**
 * @route   GET /api/v1/contact
 * @desc    Get all contact submissions (Admin only)
 * @access  Private (Admin/Editor)
 */
router.get('/',
  requireEditor,
  hasPermission('read:contacts'),
  contactController.getAllContacts
);

/**
 * @route   GET /api/v1/contact/stats
 * @desc    Get contact statistics (Admin only)
 * @access  Private (Admin/Editor)
 */
router.get('/stats',
  requireEditor,
  hasPermission('read:contacts'),
  contactController.getContactStats
);

/**
 * @route   GET /api/v1/contact/export
 * @desc    Export contacts (Admin only)
 * @access  Private (Admin/Editor)
 */
router.get('/export',
  requireEditor,
  hasPermission('read:contacts'),
  contactController.exportContacts
);

/**
 * @route   GET /api/v1/contact/:id
 * @desc    Get single contact submission (Admin only)
 * @access  Private (Admin/Editor)
 */
router.get('/:id',
  requireEditor,
  hasPermission('read:contacts'),
  contactController.getContact
);

/**
 * @route   PUT /api/v1/contact/:id/status
 * @desc    Update contact status (Admin only)
 * @access  Private (Admin/Editor)
 */
router.put('/:id/status',
  requireEditor,
  hasPermission('write:contacts'),
  validateRequest(contactSchemas.updateStatus),
  contactController.updateContactStatus
);

/**
 * @route   DELETE /api/v1/contact/:id
 * @desc    Delete contact submission (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id',
  requireAdmin,
  hasPermission('delete:contacts'),
  contactController.deleteContact
);

module.exports = router;

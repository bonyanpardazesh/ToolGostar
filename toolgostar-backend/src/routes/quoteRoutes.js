/**
 * Quote Routes
 * /api/v1/quotes
 */

const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { verifyToken, requireAdmin, requireEditor, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { quoteSchemas } = require('../validations/quoteValidation');

/**
 * @route   GET /api/v1/quotes
 * @desc    Get all quote requests with filtering and pagination
 * @access  Private (Editor/Admin)
 */
router.get('/',
  verifyToken,
  requireEditor,
  hasPermission('read:quotes'),
  validateRequest(quoteSchemas.query),
  quoteController.getAllQuotes
);

/**
 * @route   GET /api/v1/quotes/stats
 * @desc    Get quote request statistics
 * @access  Private (Editor/Admin)
 */
router.get('/stats',
  verifyToken,
  requireEditor,
  hasPermission('read:quotes'),
  quoteController.getQuoteStats
);

/**
 * @route   GET /api/v1/quotes/export
 * @desc    Export quote requests to CSV
 * @access  Private (Editor/Admin)
 */
router.get('/export',
  verifyToken,
  requireEditor,
  hasPermission('read:quotes'),
  quoteController.exportQuotes
);

/**
 * @route   GET /api/v1/quotes/:id
 * @desc    Get single quote request by ID
 * @access  Private (Editor/Admin)
 */
router.get('/:id',
  verifyToken,
  requireEditor,
  hasPermission('read:quotes'),
  quoteController.getQuoteById
);

/**
 * @route   PUT /api/v1/quotes/:id
 * @desc    Update quote request
 * @access  Private (Editor/Admin)
 */
router.put('/:id',
  verifyToken,
  requireEditor,
  hasPermission('write:quotes'),
  validateRequest(quoteSchemas.update),
  quoteController.updateQuote
);

/**
 * @route   PUT /api/v1/quotes/:id/status
 * @desc    Update quote request status
 * @access  Private (Editor/Admin)
 */
router.put('/:id/status',
  verifyToken,
  requireEditor,
  hasPermission('write:quotes'),
  validateRequest(quoteSchemas.updateStatus),
  quoteController.updateQuoteStatus
);

/**
 * @route   PUT /api/v1/quotes/:id/assign
 * @desc    Assign quote request to user
 * @access  Private (Editor/Admin)
 */
router.put('/:id/assign',
  verifyToken,
  requireEditor,
  hasPermission('write:quotes'),
  validateRequest(quoteSchemas.assign),
  quoteController.assignQuote
);

/**
 * @route   DELETE /api/v1/quotes/:id
 * @desc    Delete quote request
 * @access  Private (Admin only)
 */
router.delete('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('delete:quotes'),
  quoteController.deleteQuote
);

module.exports = router;

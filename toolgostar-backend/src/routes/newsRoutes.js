/**
 * News Routes
 * /api/v1/news
 */

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, requireAdmin, requireEditor, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { newsSchemas } = require('../validations/newsValidation');

/**
 * @route   GET /api/v1/news
 * @desc    Get all news articles with filtering and pagination
 * @access  Public
 */
router.get('/',
  newsController.getAllNews
);

/**
 * @route   GET /api/v1/news/categories
 * @desc    Get all news categories
 * @access  Public
 */
router.get('/categories',
  newsController.getNewsCategories
);

/**
 * @route   GET /api/v1/news/featured
 * @desc    Get featured news articles
 * @access  Public
 */
router.get('/featured',
  newsController.getFeaturedNews
);

/**
 * @route   GET /api/v1/news/stats
 * @desc    Get news statistics
 * @access  Private (Editor/Admin)
 */
router.get('/stats',
  verifyToken,
  requireEditor,
  hasPermission('read:news'),
  newsController.getNewsStats
);

/**
 * @route   GET /api/v1/news/:id
 * @desc    Get single news article by ID
 * @access  Public
 */
router.get('/:id',
  newsController.getNewsById
);

/**
 * @route   GET /api/v1/news/slug/:slug
 * @desc    Get news article by slug
 * @access  Public
 */
router.get('/slug/:slug',
  newsController.getNewsBySlug
);

/**
 * @route   POST /api/v1/news
 * @desc    Create new news article
 * @access  Private (Editor/Admin)
 */
router.post('/',
  verifyToken,
  requireEditor,
  hasPermission('write:news'),
  validateRequest(newsSchemas.create),
  newsController.createNews
);

/**
 * @route   PUT /api/v1/news/:id
 * @desc    Update news article
 * @access  Private (Editor/Admin)
 */
router.put('/:id',
  verifyToken,
  requireEditor,
  hasPermission('write:news'),
  validateRequest(newsSchemas.update),
  newsController.updateNews
);

/**
 * @route   DELETE /api/v1/news/:id
 * @desc    Delete news article
 * @access  Private (Admin only)
 */
router.delete('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('delete:news'),
  newsController.deleteNews
);

module.exports = router;

/**
 * Product Routes
 * /api/v1/products
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireAdmin, requireEditor, optionalAuth, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { productSchemas } = require('../validations/productValidation');
const { cache } = require('../config/redis');
const { uploadProductFiles } = require('../middleware/upload');

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/',
  optionalAuth,
  productController.getAllProducts
);

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/search',
  productController.searchProducts
);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured',
  productController.getFeaturedProducts
);

/**
 * @route   GET /api/v1/products/categories
 * @desc    Get product categories
 * @access  Public
 */
router.get('/categories',
  productController.getCategories
);

/**
 * @route   GET /api/v1/products/category/:slug
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:slug',
  productController.getProductsByCategory
);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private (Admin/Editor)
 */
router.post('/',
  requireEditor,
  hasPermission('write:products'),
  uploadProductFiles,
  validateRequest(productSchemas.create),
  productController.createProduct
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product by ID or slug
 * @access  Public
 */
router.get('/:id',
  optionalAuth,
  productController.getProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Admin/Editor)
 */
router.put('/:id',
  requireEditor,
  hasPermission('write:products'),
  uploadProductFiles,
  validateRequest(productSchemas.update),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Admin only)
 */
router.delete('/:id',
  requireAdmin,
  productController.deleteProduct
);

module.exports = router;

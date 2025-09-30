/**
 * Product Controller
 * Handle product catalog management
 */

const { Product, ProductCategory } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { cache, cacheKeys } = require('../config/redis');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ProductController {
  /**
   * Get all products with filtering and pagination
   * GET /api/v1/products
   */
  getAllProducts = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      active,
      search,
      sort = 'created_at',
      order = 'desc',
      lang
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const cacheKey = cacheKeys.products(category, page, limit, lang);

    // Try to get from cache first
    let cachedData = await cache.get(cacheKey);
    if (cachedData && !search) { // Don't cache search results
      return res.json({
        success: true,
        data: cachedData.products,
        pagination: cachedData.pagination,
        cached: true
      });
    }

    // Build where clause
    const where = {};

    // Category filter
    if (category) {
      const categoryObj = await ProductCategory.findOne({ 
        where: { slug: category } 
      });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    // Active filter (default to true for public API)
    if (active !== undefined) {
      where.isActive = active === 'true';
    } else {
      where.isActive = true; // Default: only show active products
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { fullDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Language visibility filter - removed as we now use single icon field
    // Products are now visible in all languages by default


    // Validate sort field
    const allowedSortFields = ['name', 'created_at', 'updated_at', 'sort_order'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Execute query
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'description']
      }],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    const result = {
      products: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    };

    // Cache the result (if not search)
    if (!search) {
      await cache.set(cacheKey, result, 1800); // 30 minutes
    }

    logger.info('Products retrieved', { 
      count: rows.length,
      page,
      category,
      search: !!search
    });

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });
  });

  /**
   * Get single product by ID or slug
   * GET /api/v1/products/:id
   */
  getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheKeys.product(id);

    // Try cache first
    let product = await cache.get(cacheKey);
    
    if (!product) {
      // Find by ID or slug
      product = await Product.findOne({
        where: {
          [Op.or]: [
            { id: id },
            { slug: id }
          ],
          isActive: true // Only active products for public API
        },
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description']
        }]
      });

      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      // Cache for 1 hour
      await cache.set(cacheKey, product, 3600);
    }

    logger.info('Product retrieved', { productId: product.id, slug: product.slug });

    res.json({
      success: true,
      data: product
    });
  });

  /**
   * Create new product (Admin only)
   * POST /api/v1/products
   */
  createProduct = asyncHandler(async (req, res) => {
    // Parse JSON strings from FormData
    if (typeof req.body.name === 'string') {
      req.body.name = JSON.parse(req.body.name || '{}');
    }
    if (typeof req.body.shortDescription === 'string') {
      req.body.shortDescription = JSON.parse(req.body.shortDescription || '{}');
    }
    if (typeof req.body.features === 'string') {
      req.body.features = JSON.parse(req.body.features || '[]');
    }
    if (typeof req.body.applications === 'string') {
      req.body.applications = JSON.parse(req.body.applications || '[]');
    }
    if (typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications || '{}');
    }

    const { 
      name, categoryId, shortDescription, icon, 
      features, applications, specifications
    } = req.body;

    // Handle file uploads
    let featuredImagePath = null;
    if (req.files && req.files.featuredImage) {
      featuredImagePath = `/uploads/${req.files.featuredImage[0].filename}`;
    }
    
    let catalogPath = null;
    if (req.files && req.files.catalog) {
      catalogPath = `/uploads/${req.files.catalog[0].filename}`;
    }

    // Verify category exists
    if (categoryId) {
      const category = await ProductCategory.findByPk(categoryId);
      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    const newProduct = await Product.create({
      name,
      categoryId,
      shortDescription,
      icon,
      features: features || [],
      applications: applications || [],
      specifications: specifications || {},
      featuredImage: featuredImagePath,
      catalogUrl: catalogPath,
      isActive: req.body.isActive,
      sortOrder: req.body.sortOrder,
    });

    // Include category in response
    await newProduct.reload({
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    // Clear related caches
    await cache.deletePattern('products:*');

    logger.info('Product created', { 
      productId: newProduct.id,
      name: newProduct.name,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  });

  /**
   * Update product (Admin only)
   * PUT /api/v1/products/:id
   */
  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle file uploads
    if (req.files && req.files.featuredImage) {
      updateData.featuredImage = `/uploads/${req.files.featuredImage[0].filename}`;
    }
    if (req.files && req.files.catalog) {
      updateData.catalogUrl = `/uploads/${req.files.catalog[0].filename}`;
    }
    
    // Ensure JSON fields are parsed if they come as strings
    if (typeof updateData.name === 'string') {
      updateData.name = JSON.parse(updateData.name || '{}');
    }
    if (typeof updateData.shortDescription === 'string') {
      updateData.shortDescription = JSON.parse(updateData.shortDescription || '{}');
    }
    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }
    if (typeof updateData.applications === 'string') {
      updateData.applications = JSON.parse(updateData.applications);
    }
    if (typeof updateData.specifications === 'string') {
      updateData.specifications = JSON.parse(updateData.specifications);
    }

    // Explicitly pull the fields to update to prevent mass assignment vulnerabilities
    const allowedUpdates = [
      'name', 'slug', 'shortDescription', 'fullDescription', 
      'categoryId', 'icon', 'specifications', 
      'features', 'applications', 'featuredImage', 'catalogUrl', 
      'galleryImages', 'metaTitle', 'metaDescription', 
      'isActive', 'featured', 'sortOrder', 'status'
    ];
    const finalUpdateData = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        finalUpdateData[key] = updateData[key];
      }
    }


    const [updatedRows] = await Product.update(finalUpdateData, {
      where: { id: id },
    });

    if (updatedRows === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Reload with category
    const product = await Product.findByPk(id);
    await product.reload({
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    // Clear caches
    await cache.del(cacheKeys.product(id));
    await cache.del(cacheKeys.product(product.slug));
    await cache.deletePattern('products:*');

    logger.info('Product updated', { 
      productId: product.id,
      updatedBy: req.user.id,
      changes: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  });

  /**
   * Delete product (Admin only)
   * DELETE /api/v1/products/:id
   */
  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Store slug for cache cleanup
    const slug = product.slug;

    // Delete product
    await product.destroy();

    // Clear caches
    await cache.del(cacheKeys.product(id));
    await cache.del(cacheKeys.product(slug));
    await cache.deletePattern('products:*');

    logger.info('Product deleted', { 
      productId: id,
      name: product.name,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });

  /**
   * Get product categories
   * GET /api/v1/products/categories
   */
  getCategories = asyncHandler(async (req, res) => {
    const cacheKey = cacheKeys.categories('product');

    // Try cache first
    let categories = await cache.get(cacheKey);

    if (!categories) {
      categories = await ProductCategory.findWithProductCounts();
      
      // Cache for 2 hours
      await cache.set(cacheKey, categories, 7200);
    }

    res.json({
      success: true,
      data: categories
    });
  });

  /**
   * Get featured products
   * GET /api/v1/products/featured
   */
  getFeaturedProducts = asyncHandler(async (req, res) => {
    const { limit = 6 } = req.query;
    const cacheKey = `products:featured:${limit}`;

    // Try cache first
    let products = await cache.get(cacheKey);

    if (!products) {
      products = await Product.findAll({
        where: { 
          isActive: true,
          featured: true 
        },
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }],
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      // Cache for 1 hour
      await cache.set(cacheKey, products, 3600);
    }

    res.json({
      success: true,
      data: products
    });
  });

  /**
   * Search products
   * GET /api/v1/products/search
   */
  searchProducts = asyncHandler(async (req, res) => {
    const { q: query, category, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH_QUERY');
    }

    const where = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { shortDescription: { [Op.iLike]: `%${query}%` } },
        { fullDescription: { [Op.iLike]: `%${query}%` } },
        { features: { [Op.contains]: [query] } },
        { applications: { [Op.contains]: [query] } }
      ]
    };

    // Add category filter if specified
    if (category) {
      const categoryObj = await ProductCategory.findOne({ 
        where: { slug: category } 
      });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['name', 'ASC']],
      limit: parseInt(limit)
    });

    logger.info('Product search performed', { 
      query,
      category,
      resultsCount: products.length
    });

    res.json({
      success: true,
      data: products,
      query,
      totalResults: products.length
    });
  });

  /**
   * Get products by category slug
   * GET /api/v1/products/category/:slug
   */
  getProductsByCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await ProductCategory.findBySlug(slug);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Product.findAndCountAll({
      where: { 
        categoryId: category.id,
        isActive: true 
      },
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: rows,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  });
}

module.exports = new ProductController();

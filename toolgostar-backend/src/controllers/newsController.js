/**
 * News Controller
 * Handles all news-related operations
 */

const { News, NewsCategory, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/error');
const logger = require('../utils/logger');

class NewsController {
  /**
   * @route   GET /api/v1/news
   * @desc    Get all news articles with filtering and pagination
   * @access  Public
   */
  getAllNews = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.categoryId = category;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get news articles
    const { count, rows: news } = await News.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  });

  /**
   * @route   GET /api/v1/news/:id
   * @desc    Get single news article by ID
   * @access  Public
   */
  getNewsById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const news = await News.findByPk(id, {
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!news) {
      throw new AppError('News article not found', 404, 'NEWS_NOT_FOUND');
    }

    // Increment view count if published
    if (news.status === 'published') {
      await news.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: { news }
    });
  });

  /**
   * @route   GET /api/v1/news/slug/:slug
   * @desc    Get news article by slug
   * @access  Public
   */
  getNewsBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const news = await News.findBySlug(slug);

    if (!news) {
      throw new AppError('News article not found', 404, 'NEWS_NOT_FOUND');
    }

    // Increment view count if published
    if (news.status === 'published') {
      await news.incrementViews();
    }

    res.status(200).json({
      success: true,
      data: { news }
    });
  });

  /**
   * @route   POST /api/v1/news
   * @desc    Create new news article
   * @access  Private (Editor/Admin)
   */
  createNews = asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      featuredImage,
      galleryImages,
      metaTitle,
      metaDescription,
      tags,
      status = 'draft',
      isFeatured = false
    } = req.body;

    // Set author to current user
    const authorId = req.user.id;

    // Check if slug already exists
    if (slug) {
      const existingNews = await News.findOne({ where: { slug } });
      if (existingNews) {
        throw new AppError('A news article with this slug already exists', 400, 'SLUG_EXISTS');
      }
    }

    // Verify category exists
    const category = await NewsCategory.findByPk(categoryId);
    if (!category) {
      throw new AppError('News category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const news = await News.create({
      title,
      slug,
      excerpt,
      content,
      categoryId,
      featuredImage,
      galleryImages: galleryImages ? JSON.stringify(galleryImages) : '[]',
      metaTitle,
      metaDescription,
      tags: tags ? JSON.stringify(tags) : '[]',
      status,
      isFeatured,
      authorId
    });

    // Fetch the created news with associations
    const createdNews = await News.findByPk(news.id, {
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    logger.info(`News article created: ${createdNews.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { news: createdNews },
      message: 'News article created successfully'
    });
  });

  /**
   * @route   PUT /api/v1/news/:id
   * @desc    Update news article
   * @access  Private (Editor/Admin)
   */
  updateNews = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const news = await News.findByPk(id);
    if (!news) {
      throw new AppError('News article not found', 404, 'NEWS_NOT_FOUND');
    }

    // Check if slug already exists (excluding current article)
    if (updateData.slug && updateData.slug !== news.slug) {
      const existingNews = await News.findOne({ 
        where: { 
          slug: updateData.slug,
          id: { [Op.ne]: id }
        } 
      });
      if (existingNews) {
        throw new AppError('A news article with this slug already exists', 400, 'SLUG_EXISTS');
      }
    }

    // Verify category exists if provided
    if (updateData.categoryId) {
      const category = await NewsCategory.findByPk(updateData.categoryId);
      if (!category) {
        throw new AppError('News category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Handle JSON fields
    if (updateData.galleryImages) {
      updateData.galleryImages = JSON.stringify(updateData.galleryImages);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    await news.update(updateData);

    // Fetch updated news with associations
    const updatedNews = await News.findByPk(id, {
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    logger.info(`News article updated: ${updatedNews.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { news: updatedNews },
      message: 'News article updated successfully'
    });
  });

  /**
   * @route   DELETE /api/v1/news/:id
   * @desc    Delete news article
   * @access  Private (Admin only)
   */
  deleteNews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const news = await News.findByPk(id);
    if (!news) {
      throw new AppError('News article not found', 404, 'NEWS_NOT_FOUND');
    }

    await news.destroy();

    logger.info(`News article deleted: ${news.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'News article deleted successfully'
    });
  });

  /**
   * @route   GET /api/v1/news/categories
   * @desc    Get all news categories
   * @access  Public
   */
  getNewsCategories = asyncHandler(async (req, res) => {
    const categories = await NewsCategory.findAll({
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  });

  /**
   * @route   GET /api/v1/news/featured
   * @desc    Get featured news articles
   * @access  Public
   */
  getFeaturedNews = asyncHandler(async (req, res) => {
    const { limit = 5 } = req.query;

    const news = await News.findFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { news }
    });
  });

  /**
   * @route   GET /api/v1/news/stats
   * @desc    Get news statistics
   * @access  Private (Editor/Admin)
   */
  getNewsStats = asyncHandler(async (req, res) => {
    const totalNews = await News.count();
    const publishedNews = await News.count({ where: { status: 'published' } });
    const draftNews = await News.count({ where: { status: 'draft' } });
    const featuredNews = await News.count({ where: { isFeatured: true } });
    
    const totalViews = await News.sum('viewsCount') || 0;
    
    const recentNews = await News.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: NewsCategory,
          as: 'category',
          attributes: ['name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalNews,
          publishedNews,
          draftNews,
          featuredNews,
          totalViews
        },
        recentNews
      }
    });
  });
}

module.exports = new NewsController();

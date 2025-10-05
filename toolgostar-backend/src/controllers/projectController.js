/**
 * Project Controller
 * Handle project gallery and showcase management
 */

const { Project, ProjectCategory } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { cache, cacheKeys } = require('../config/redis');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ProjectController {
  /**
   * Get all projects with filtering and pagination
   * GET /api/v1/projects
   */
  getAllProjects = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 12,
      category,
      featured,
      status,
      location,
      search,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const cacheKey = cacheKeys.projects(category, page, limit);

    // Try cache first (only for non-search queries)
    let cachedData = await cache.get(cacheKey);
    if (cachedData && !search) {
      return res.json({
        success: true,
        data: cachedData.projects,
        pagination: cachedData.pagination,
        cached: true
      });
    }

    // Build where clause
    const where = {};
    
    // Only show public projects for non-authenticated users
    if (!req.user) {
      where.isPublic = true;
    }

    // Category filter
    if (category) {
      const categoryObj = await ProjectCategory.findOne({ 
        where: { slug: category } 
      });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }

    // Featured filter
    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    // Status filter
    if (status) {
      const validStatuses = ['completed', 'ongoing', 'planned'];
      if (validStatuses.includes(status)) {
        where.status = status;
      }
    }

    // Location filter
    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { clientName: { [Op.iLike]: `%${search}%` } },
        { equipmentUsed: { [Op.contains]: [search] } }
      ];
    }

    // Validate sort field
    const allowedSortFields = ['title', 'created_at', 'updated_at', 'sort_order', 'completion_date'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Execute query
    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{
        model: ProjectCategory,
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
      projects: rows,
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

    logger.info('Projects retrieved', { 
      count: rows.length,
      page,
      category,
      search: !!search
    });

    res.json({
      success: true,
      data: result.projects,
      pagination: result.pagination
    });
  });

  /**
   * Get single project by ID or slug
   * GET /api/v1/projects/:id
   */
  getProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheKeys.project(id);

    // Try cache first
    let project = await cache.get(cacheKey);
    
    if (!project) {
      // Find by ID or slug
      project = await Project.findOne({
        where: {
          [Op.or]: [
            { id: id },
            { slug: id }
          ],
          isPublic: true // Only public projects
        },
        include: [{
          model: ProjectCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description']
        }]
      });

      if (!project) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Cache for 1 hour
      await cache.set(cacheKey, project, 3600);
    }

    logger.info('Project retrieved', { projectId: project.id, slug: project.slug });

    res.json({
      success: true,
      data: project
    });
  });

  /**
   * Create new project (Admin only)
   * POST /api/v1/projects
   */
  createProject = asyncHandler(async (req, res) => {
    const projectData = req.body;

    // Verify category exists
    if (projectData.categoryId) {
      const category = await ProjectCategory.findByPk(projectData.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Create project
    const project = await Project.create(projectData);

    // Include category in response
    await project.reload({
      include: [{
        model: ProjectCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    // Clear related caches
    await cache.deletePattern('projects:*');

    logger.info('Project created', { 
      projectId: project.id,
      title: project.title,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  });

  /**
   * Update project (Admin only)
   * PUT /api/v1/projects/:id
   */
  updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Find project
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Verify category exists if being updated
    if (updateData.categoryId) {
      const category = await ProjectCategory.findByPk(updateData.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Update project
    await project.update(updateData);

    // Reload with category
    await project.reload({
      include: [{
        model: ProjectCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    // Clear caches
    await cache.del(cacheKeys.project(id));
    await cache.del(cacheKeys.project(project.slug));
    await cache.deletePattern('projects:*');

    logger.info('Project updated', { 
      projectId: project.id,
      updatedBy: req.user.id,
      changes: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  });

  /**
   * Delete project (Admin only)
   * DELETE /api/v1/projects/:id
   */
  deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Store slug for cache cleanup
    const slug = project.slug;

    // Delete project
    await project.destroy();

    // Clear caches
    await cache.del(cacheKeys.project(id));
    await cache.del(cacheKeys.project(slug));
    await cache.deletePattern('projects:*');

    logger.info('Project deleted', { 
      projectId: id,
      title: project.title,
      deletedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  });

  /**
   * Get project categories
   * GET /api/v1/projects/categories
   */
  getCategories = asyncHandler(async (req, res) => {
    const cacheKey = cacheKeys.categories('project');

    // Try cache first
    let categories = await cache.get(cacheKey);

    if (!categories) {
      categories = await ProjectCategory.findWithProjectCounts();
      
      // Cache for 2 hours
      await cache.set(cacheKey, categories, 7200);
    }

    res.json({
      success: true,
      data: categories
    });
  });

  /**
   * Get featured projects
   * GET /api/v1/projects/featured
   */
  getFeaturedProjects = asyncHandler(async (req, res) => {
    const { limit = 6 } = req.query;
    const cacheKey = `projects:featured:${limit}`;

    // Try cache first
    let projects = await cache.get(cacheKey);

    if (!projects) {
      projects = await Project.findAll({
        where: { 
          isPublic: true,
          isFeatured: true 
        },
        include: [{
          model: ProjectCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }],
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      // Cache for 1 hour
      await cache.set(cacheKey, projects, 3600);
    }

    res.json({
      success: true,
      data: projects
    });
  });

  /**
   * Search projects
   * GET /api/v1/projects/search
   */
  searchProjects = asyncHandler(async (req, res) => {
    const { q: query, category, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH_QUERY');
    }

    const where = {
      isPublic: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { location: { [Op.iLike]: `%${query}%` } },
        { clientName: { [Op.iLike]: `%${query}%` } },
        { equipmentUsed: { [Op.contains]: [query] } }
      ]
    };

    // Add category filter if specified
    if (category) {
      const categoryObj = await ProjectCategory.findOne({ 
        where: { slug: category } 
      });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }

    const projects = await Project.findAll({
      where,
      include: [{
        model: ProjectCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    logger.info('Project search performed', { 
      query,
      category,
      resultsCount: projects.length
    });

    res.json({
      success: true,
      data: projects,
      query,
      totalResults: projects.length
    });
  });

  /**
   * Get projects by category slug
   * GET /api/v1/projects/category/:slug
   */
  getProjectsByCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await ProjectCategory.findBySlug(slug);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Project.findAndCountAll({
      where: { 
        categoryId: category.id,
        isPublic: true 
      },
      include: [{
        model: ProjectCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
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

  /**
   * Get projects by status
   * GET /api/v1/projects/status/:status
   */
  getProjectsByStatus = asyncHandler(async (req, res) => {
    const { status } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const validStatuses = ['completed', 'ongoing', 'planned'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Project.findAndCountAll({
      where: { 
        status,
        isPublic: true 
      },
      include: [{
        model: ProjectCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: rows,
      status,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  });

  /**
   * Get project statistics
   * GET /api/v1/projects/stats
   */
  getProjectStats = asyncHandler(async (req, res) => {
    const cacheKey = 'projects:stats';

    // Try cache first
    let stats = await cache.get(cacheKey);

    if (!stats) {
      const [totalProjects, completedProjects, ongoingProjects, featuredProjects] = await Promise.all([
        Project.count({ where: { isPublic: true } }),
        Project.count({ where: { isPublic: true, status: 'completed' } }),
        Project.count({ where: { isPublic: true, status: 'ongoing' } }),
        Project.count({ where: { isPublic: true, isFeatured: true } })
      ]);

      // Get projects by category
      const projectsByCategory = await Project.findAll({
        where: { isPublic: true },
        attributes: [
          'categoryId',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        include: [{
          model: ProjectCategory,
          as: 'category',
          attributes: ['name', 'slug']
        }],
        group: ['categoryId', 'category.id'],
        raw: false
      });

      stats = {
        total: totalProjects,
        completed: completedProjects,
        ongoing: ongoingProjects,
        featured: featuredProjects,
        byCategory: projectsByCategory.map(item => ({
          category: item.category.name,
          slug: item.category.slug,
          count: parseInt(item.get('count'))
        }))
      };

      // Cache for 1 hour
      await cache.set(cacheKey, stats, 3600);
    }

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new ProjectController();

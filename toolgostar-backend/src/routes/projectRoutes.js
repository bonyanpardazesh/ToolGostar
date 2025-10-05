/**
 * Project Routes
 * /api/v1/projects
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, requireAdmin, requireEditor, optionalAuth, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { projectSchemas } = require('../validations/projectValidation');

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects with filtering and pagination
 * @access  Public
 */
router.get('/',
  optionalAuth,
  projectController.getAllProjects
);

/**
 * @route   GET /api/v1/projects/search
 * @desc    Search projects
 * @access  Public
 */
router.get('/search',
  projectController.searchProjects
);

/**
 * @route   GET /api/v1/projects/featured
 * @desc    Get featured projects
 * @access  Public
 */
router.get('/featured',
  projectController.getFeaturedProjects
);

/**
 * @route   GET /api/v1/projects/stats
 * @desc    Get project statistics
 * @access  Public
 */
router.get('/stats',
  projectController.getProjectStats
);

/**
 * @route   GET /api/v1/projects/categories
 * @desc    Get project categories
 * @access  Public
 */
router.get('/categories',
  projectController.getCategories
);

/**
 * @route   GET /api/v1/projects/category/:slug
 * @desc    Get projects by category
 * @access  Public
 */
router.get('/category/:slug',
  projectController.getProjectsByCategory
);

/**
 * @route   GET /api/v1/projects/status/:status
 * @desc    Get projects by status
 * @access  Public
 */
router.get('/status/:status',
  projectController.getProjectsByStatus
);

/**
 * @route   POST /api/v1/projects
 * @desc    Create new project
 * @access  Private (Admin/Editor)
 */
router.post('/',
  requireEditor,
  hasPermission('write:projects'),
  validateRequest(projectSchemas.create),
  projectController.createProject
);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get single project by ID or slug
 * @access  Public
 */
router.get('/:id',
  optionalAuth,
  projectController.getProject
);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Admin/Editor)
 */
router.put('/:id',
  requireEditor,
  hasPermission('write:projects'),
  validateRequest(projectSchemas.update),
  projectController.updateProject
);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Admin only)
 */
router.delete('/:id',
  requireAdmin,
  projectController.deleteProject
);

module.exports = router;

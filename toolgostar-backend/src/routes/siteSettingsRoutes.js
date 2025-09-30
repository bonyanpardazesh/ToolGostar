/**
 * Site Settings Routes
 * /api/v1/settings
 */

const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');
const { verifyToken, requireAdmin, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { siteSettingsSchemas } = require('../validations/siteSettingsValidation');

/**
 * @route   GET /api/v1/settings
 * @desc    Get all site settings grouped by category
 * @access  Private (Admin only)
 */
router.get('/',
  verifyToken,
  requireAdmin,
  hasPermission('read:settings'),
  validateRequest(siteSettingsSchemas.query),
  siteSettingsController.getAllSettings
);

/**
 * @route   GET /api/v1/settings/categories
 * @desc    Get all setting categories
 * @access  Private (Admin only)
 */
router.get('/categories',
  verifyToken,
  requireAdmin,
  hasPermission('read:settings'),
  siteSettingsController.getCategories
);

/**
 * @route   GET /api/v1/settings/export
 * @desc    Export all settings to JSON
 * @access  Private (Admin only)
 */
router.get('/export',
  verifyToken,
  requireAdmin,
  hasPermission('read:settings'),
  siteSettingsController.exportSettings
);

/**
 * @route   GET /api/v1/settings/:key
 * @desc    Get single setting by key
 * @access  Private (Admin only)
 */
router.get('/:key',
  verifyToken,
  requireAdmin,
  hasPermission('read:settings'),
  siteSettingsController.getSettingByKey
);

/**
 * @route   POST /api/v1/settings
 * @desc    Create new setting
 * @access  Private (Admin only)
 */
router.post('/',
  verifyToken,
  requireAdmin,
  hasPermission('write:settings'),
  validateRequest(siteSettingsSchemas.create),
  siteSettingsController.createSetting
);

/**
 * @route   PUT /api/v1/settings/bulk
 * @desc    Update multiple settings at once
 * @access  Private (Admin only)
 */
router.put('/bulk',
  verifyToken,
  requireAdmin,
  hasPermission('write:settings'),
  validateRequest(siteSettingsSchemas.bulkUpdate),
  siteSettingsController.updateBulkSettings
);

/**
 * @route   POST /api/v1/settings/import
 * @desc    Import settings from JSON
 * @access  Private (Admin only)
 */
router.post('/import',
  verifyToken,
  requireAdmin,
  hasPermission('write:settings'),
  validateRequest(siteSettingsSchemas.import),
  siteSettingsController.importSettings
);

/**
 * @route   PUT /api/v1/settings/:key
 * @desc    Update single setting by key
 * @access  Private (Admin only)
 */
router.put('/:key',
  verifyToken,
  requireAdmin,
  hasPermission('write:settings'),
  validateRequest(siteSettingsSchemas.update),
  siteSettingsController.updateSetting
);

/**
 * @route   DELETE /api/v1/settings/:key
 * @desc    Delete setting by key
 * @access  Private (Admin only)
 */
router.delete('/:key',
  verifyToken,
  requireAdmin,
  hasPermission('delete:settings'),
  siteSettingsController.deleteSetting
);

module.exports = router;

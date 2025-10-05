/**
 * Site Settings Controller
 * Handles all site settings-related operations
 */

const { SiteSettings, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/error');
const logger = require('../utils/logger');

class SiteSettingsController {
  /**
   * @route   GET /api/v1/settings
   * @desc    Get all site settings grouped by category
   * @access  Private (Admin only)
   */
  getAllSettings = asyncHandler(async (req, res) => {
    const { category } = req.query;

    // Build where clause
    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    const settings = await SiteSettings.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['settingKey', 'ASC']]
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: { settings: groupedSettings }
    });
  });

  /**
   * @route   GET /api/v1/settings/:key
   * @desc    Get single setting by key
   * @access  Private (Admin only)
   */
  getSettingByKey = asyncHandler(async (req, res) => {
    const { key } = req.params;

    const setting = await SiteSettings.findOne({
      where: { settingKey: key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { setting }
    });
  });

  /**
   * @route   PUT /api/v1/settings/:key
   * @desc    Update single setting by key
   * @access  Private (Admin only)
   */
  updateSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, type } = req.body;

    const setting = await SiteSettings.findOne({
      where: { settingKey: key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    // Validate value based on type
    const validatedValue = this.validateSettingValue(value, type || setting.settingType);

    await setting.update({
      settingValue: validatedValue,
      ...(type && { settingType: type })
    });

    logger.info(`Site setting updated: ${key} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { setting },
      message: 'Setting updated successfully'
    });
  });

  /**
   * @route   POST /api/v1/settings
   * @desc    Create new setting
   * @access  Private (Admin only)
   */
  createSetting = asyncHandler(async (req, res) => {
    const { key, value, type, category, description } = req.body;

    // Check if setting already exists
    const existingSetting = await SiteSettings.findOne({
      where: { settingKey: key }
    });

    if (existingSetting) {
      throw new AppError('Setting with this key already exists', 400, 'SETTING_EXISTS');
    }

    // Validate value based on type
    const validatedValue = this.validateSettingValue(value, type);

    const setting = await SiteSettings.create({
      settingKey: key,
      settingValue: validatedValue,
      settingType: type,
      category: category || 'general',
      description: description || ''
    });

    logger.info(`Site setting created: ${key} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { setting },
      message: 'Setting created successfully'
    });
  });

  /**
   * @route   DELETE /api/v1/settings/:key
   * @desc    Delete setting by key
   * @access  Private (Admin only)
   */
  deleteSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;

    const setting = await SiteSettings.findOne({
      where: { settingKey: key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    await setting.destroy();

    logger.info(`Site setting deleted: ${key} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });
  });

  /**
   * @route   PUT /api/v1/settings/bulk
   * @desc    Update multiple settings at once
   * @access  Private (Admin only)
   */
  updateBulkSettings = asyncHandler(async (req, res) => {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      throw new AppError('Settings must be an array', 400, 'INVALID_INPUT');
    }

    const updatedSettings = [];
    const errors = [];

    for (const settingData of settings) {
      try {
        const { key, value, type } = settingData;
        
        const setting = await SiteSettings.findOne({
          where: { settingKey: key }
        });

        if (!setting) {
          errors.push({ key, error: 'Setting not found' });
          continue;
        }

        // Validate value based on type
        const validatedValue = this.validateSettingValue(value, type || setting.settingType);

        await setting.update({
          settingValue: validatedValue,
          ...(type && { settingType: type })
        });

        updatedSettings.push(setting);
      } catch (error) {
        errors.push({ key: settingData.key, error: error.message });
      }
    }

    logger.info(`Bulk settings update: ${updatedSettings.length} updated, ${errors.length} errors by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { 
        updatedSettings,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Updated ${updatedSettings.length} settings${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });
  });

  /**
   * @route   GET /api/v1/settings/categories
   * @desc    Get all setting categories
   * @access  Private (Admin only)
   */
  getCategories = asyncHandler(async (req, res) => {
    const categories = await SiteSettings.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(cat => cat.category);

    res.status(200).json({
      success: true,
      data: { categories: categoryList }
    });
  });

  /**
   * @route   GET /api/v1/settings/export
   * @desc    Export all settings to JSON
   * @access  Private (Admin only)
   */
  exportSettings = asyncHandler(async (req, res) => {
    const settings = await SiteSettings.findAll({
      order: [['category', 'ASC'], ['settingKey', 'ASC']]
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: req.user.email,
      settings: settings.map(setting => ({
        key: setting.settingKey,
        value: setting.settingValue,
        type: setting.settingType,
        category: setting.category,
        description: setting.description
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="site-settings-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  });

  /**
   * @route   POST /api/v1/settings/import
   * @desc    Import settings from JSON
   * @access  Private (Admin only)
   */
  importSettings = asyncHandler(async (req, res) => {
    const { settings, overwrite = false } = req.body;

    if (!Array.isArray(settings)) {
      throw new AppError('Settings must be an array', 400, 'INVALID_INPUT');
    }

    const importedSettings = [];
    const errors = [];

    for (const settingData of settings) {
      try {
        const { key, value, type, category, description } = settingData;
        
        const existingSetting = await SiteSettings.findOne({
          where: { settingKey: key }
        });

        if (existingSetting && !overwrite) {
          errors.push({ key, error: 'Setting already exists and overwrite is false' });
          continue;
        }

        // Validate value based on type
        const validatedValue = this.validateSettingValue(value, type);

        if (existingSetting) {
          await existingSetting.update({
            settingValue: validatedValue,
            settingType: type,
            category: category || 'general',
            description: description || ''
          });
          importedSettings.push(existingSetting);
        } else {
          const newSetting = await SiteSettings.create({
            settingKey: key,
            settingValue: validatedValue,
            settingType: type,
            category: category || 'general',
            description: description || ''
          });
          importedSettings.push(newSetting);
        }
      } catch (error) {
        errors.push({ key: settingData.key, error: error.message });
      }
    }

    logger.info(`Settings import: ${importedSettings.length} imported, ${errors.length} errors by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { 
        importedSettings,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Imported ${importedSettings.length} settings${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });
  });

  /**
   * Helper method to validate setting value based on type
   */
  validateSettingValue(value, type) {
    switch (type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new AppError('Value must be a valid number', 400, 'INVALID_NUMBER');
        }
        return numValue.toString();
      
      case 'boolean':
        if (typeof value === 'boolean') {
          return value.toString();
        }
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
            return 'true';
          }
          if (['false', '0', 'no', 'off'].includes(lowerValue)) {
            return 'false';
          }
        }
        throw new AppError('Value must be a valid boolean', 400, 'INVALID_BOOLEAN');
      
      case 'json':
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return value;
          } catch (error) {
            throw new AppError('Value must be valid JSON', 400, 'INVALID_JSON');
          }
        }
        throw new AppError('Value must be valid JSON', 400, 'INVALID_JSON');
      
      case 'string':
      default:
        return String(value);
    }
  }
}

module.exports = new SiteSettingsController();

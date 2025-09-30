/**
 * Media Controller
 * Handles all media-related operations including file uploads
 */

const { Media, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/error');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

class MediaController {
  /**
   * @route   GET /api/v1/media
   * @desc    Get all media files with filtering and pagination
   * @access  Private (Editor/Admin)
   */
  getAllMedia = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (type) {
      whereClause.fileType = type;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { originalName: { [Op.iLike]: `%${search}%` } },
        { filename: { [Op.iLike]: `%${search}%` } },
        { altText: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get media files
    const { count, rows: media } = await Media.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'uploader',
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
        media,
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
   * @route   GET /api/v1/media/:id
   * @desc    Get single media file by ID
   * @access  Private (Editor/Admin)
   */
  getMediaById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const media = await Media.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!media) {
      throw new AppError('Media file not found', 404, 'MEDIA_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { media }
    });
  });

  /**
   * @route   POST /api/v1/media/upload
   * @desc    Upload new media file
   * @access  Private (Editor/Admin)
   */
  uploadMedia = asyncHandler(async (req, res) => {
    console.log('📁 Media upload request received');
    console.log('📁 File:', req.file);
    console.log('📁 Body:', req.body);
    console.log('📁 User:', req.user);
    
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const {
      altText,
      caption,
      tags,
      usedInType,
      usedInId
    } = req.body;

    // Get file information
    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileType = this.getFileType(fileExtension);
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.filename}`;
    
    // Create file URL (in production, this would be the CDN URL)
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;

    // Create media record
    const media = await Media.create({
      filename: uniqueFilename,
      originalName: file.originalname,
      filePath: file.path,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType,
      altText: altText || '',
      caption: caption || '',
      tags: tags ? JSON.stringify(tags.split(',').map(tag => tag.trim())) : '[]',
      usedInType: usedInType || null,
      usedInId: usedInId ? parseInt(usedInId) : null,
      uploadedBy: req.user ? req.user.id : 1 // Default to admin user if no authentication
    });

    // Fetch the created media with associations
    const createdMedia = await Media.findByPk(media.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    logger.info(`Media file uploaded: ${createdMedia.originalName} by ${req.user ? req.user.email : 'anonymous'}`);

    res.status(201).json({
      success: true,
      data: { media: createdMedia },
      message: 'Media file uploaded successfully'
    });
  });

  /**
   * @route   PUT /api/v1/media/:id
   * @desc    Update media file metadata
   * @access  Private (Editor/Admin)
   */
  updateMedia = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const media = await Media.findByPk(id);
    if (!media) {
      throw new AppError('Media file not found', 404, 'MEDIA_NOT_FOUND');
    }

    // Handle tags array
    if (updateData.tags) {
      if (Array.isArray(updateData.tags)) {
        updateData.tags = JSON.stringify(updateData.tags);
      } else if (typeof updateData.tags === 'string') {
        updateData.tags = JSON.stringify(updateData.tags.split(',').map(tag => tag.trim()));
      }
    }

    await media.update(updateData);

    // Fetch updated media with associations
    const updatedMedia = await Media.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    logger.info(`Media file updated: ${updatedMedia.originalName} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { media: updatedMedia },
      message: 'Media file updated successfully'
    });
  });

  /**
   * @route   DELETE /api/v1/media/:id
   * @desc    Delete media file
   * @access  Private (Admin only)
   */
  deleteMedia = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const media = await Media.findByPk(id);
    if (!media) {
      throw new AppError('Media file not found', 404, 'MEDIA_NOT_FOUND');
    }

    // Delete physical file
    try {
      await fs.unlink(media.filePath);
    } catch (error) {
      logger.warn(`Failed to delete physical file: ${media.filePath}`, error);
    }

    // Delete database record
    await media.destroy();

    logger.info(`Media file deleted: ${media.originalName} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Media file deleted successfully'
    });
  });

  /**
   * @route   GET /api/v1/media/stats
   * @desc    Get media statistics
   * @access  Private (Editor/Admin)
   */
  getMediaStats = asyncHandler(async (req, res) => {
    const totalMedia = await Media.count();
    const imageCount = await Media.count({ where: { fileType: 'image' } });
    const documentCount = await Media.count({ where: { fileType: 'document' } });
    const videoCount = await Media.count({ where: { fileType: 'video' } });
    const audioCount = await Media.count({ where: { fileType: 'audio' } });
    
    const totalSize = await Media.sum('fileSize') || 0;
    
    const recentMedia = await Media.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Get file type distribution
    const fileTypeStats = await Media.findAll({
      attributes: [
        'fileType',
        [Media.sequelize.fn('COUNT', Media.sequelize.col('id')), 'count'],
        [Media.sequelize.fn('SUM', Media.sequelize.col('fileSize')), 'totalSize']
      ],
      group: ['fileType'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMedia,
          imageCount,
          documentCount,
          videoCount,
          audioCount,
          totalSize: this.formatFileSize(totalSize)
        },
        fileTypeStats,
        recentMedia
      }
    });
  });

  /**
   * @route   GET /api/v1/media/types/:type
   * @desc    Get media files by type
   * @access  Private (Editor/Admin)
   */
  getMediaByType = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    const validTypes = ['image', 'document', 'video', 'audio'];
    if (!validTypes.includes(type)) {
      throw new AppError('Invalid media type', 400, 'INVALID_TYPE');
    }

    const media = await Media.findAll({
      where: { fileType: type },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: { media }
    });
  });

  /**
   * Helper method to determine file type from extension
   */
  getFileType(extension) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac'];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    if (documentExtensions.includes(extension)) return 'document';
    
    return 'other';
  }

  /**
   * Helper method to format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new MediaController();

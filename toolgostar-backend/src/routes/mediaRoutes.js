/**
 * Media Routes
 * /api/v1/media
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mediaController = require('../controllers/mediaController');
const { verifyToken, requireAdmin, requireEditor, hasPermission } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { mediaSchemas } = require('../validations/mediaValidation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'video/wmv': '.wmv',
    'video/flv': '.flv',
    'video/webm': '.webm',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/aac': '.aac',
    'audio/flac': '.flac',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Single file upload
  }
});

/**
 * @route   GET /api/v1/media
 * @desc    Get all media files with filtering and pagination
 * @access  Private (Editor/Admin)
 */
router.get('/',
  verifyToken,
  requireEditor,
  hasPermission('read:media'),
  mediaController.getAllMedia
);

/**
 * @route   GET /api/v1/media/stats
 * @desc    Get media statistics
 * @access  Private (Editor/Admin)
 */
router.get('/stats',
  verifyToken,
  requireEditor,
  hasPermission('read:media'),
  mediaController.getMediaStats
);

/**
 * @route   GET /api/v1/media/types/:type
 * @desc    Get media files by type
 * @access  Private (Editor/Admin)
 */
router.get('/types/:type',
  verifyToken,
  requireEditor,
  hasPermission('read:media'),
  mediaController.getMediaByType
);

/**
 * @route   GET /api/v1/media/:id
 * @desc    Get single media file by ID
 * @access  Private (Editor/Admin)
 */
router.get('/:id',
  verifyToken,
  requireEditor,
  hasPermission('read:media'),
  mediaController.getMediaById
);

/**
 * @route   POST /api/v1/media/upload
 * @desc    Upload new media file
 * @access  Private (Editor/Admin)
 */
router.post('/upload',
  upload.single('file'),
  mediaController.uploadMedia
);

/**
 * @route   PUT /api/v1/media/:id
 * @desc    Update media file metadata
 * @access  Private (Editor/Admin)
 */
router.put('/:id',
  verifyToken,
  requireEditor,
  hasPermission('write:media'),
  validateRequest(mediaSchemas.update),
  mediaController.updateMedia
);

/**
 * @route   DELETE /api/v1/media/:id
 * @desc    Delete media file
 * @access  Private (Admin only)
 */
router.delete('/:id',
  verifyToken,
  requireAdmin,
  hasPermission('delete:media'),
  mediaController.deleteMedia
);

module.exports = router;

/**
 * Media Model
 * File uploads and media library management
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Filename is required'
      }
    }
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name',
    validate: {
      notEmpty: {
        msg: 'Original filename is required'
      }
    }
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path',
    validate: {
      notEmpty: {
        msg: 'File path is required'
      }
    }
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
    // validate: {
    //   isUrl: {
    //     msg: 'File URL must be valid'
    //   }
    // }
  },
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size'
    // validate: {
    //   min: {
    //     args: 0,
    //     msg: 'File size must be positive'
    //   }
    // }
  },
  mimeType: {
    type: DataTypes.STRING(100),
    field: 'mime_type',
    validate: {
      notEmpty: {
        msg: 'MIME type is required'
      }
    }
  },
  fileType: {
    type: DataTypes.ENUM('image', 'document', 'video', 'audio', 'other'),
    field: 'file_type',
    defaultValue: 'other',
    validate: {
      isIn: {
        args: [['image', 'document', 'video', 'audio', 'other']],
        msg: 'File type must be image, document, video, audio, or other'
      }
    }
  },
  width: {
    type: DataTypes.INTEGER,
    validate: {
      min: {
        args: 0,
        msg: 'Width must be positive'
      }
    }
  },
  height: {
    type: DataTypes.INTEGER,
    validate: {
      min: {
        args: 0,
        msg: 'Height must be positive'
      }
    }
  },
  altText: {
    type: DataTypes.STRING(255),
    field: 'alt_text',
    validate: {
      len: {
        args: [0, 255],
        msg: 'Alt text cannot exceed 255 characters'
      }
    }
  },
  usedIn: {
    type: DataTypes.ENUM('product', 'project', 'news', 'company', 'other'),
    field: 'used_in',
    validate: {
      isIn: {
        args: [['product', 'project', 'news', 'company', 'other']],
        msg: 'Used in must be product, project, news, company, or other'
      }
    }
  },
  usedInId: {
    type: DataTypes.INTEGER,
    field: 'used_in_id'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    field: 'uploaded_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'media',
  timestamps: true,
  underscored: true,
  updatedAt: false, // Only track creation time
  hooks: {
    beforeCreate: (media) => {
      // Determine file type from MIME type
      if (media.mimeType && !media.fileType) {
        if (media.mimeType.startsWith('image/')) {
          media.fileType = 'image';
        } else if (media.mimeType.startsWith('video/')) {
          media.fileType = 'video';
        } else if (media.mimeType.startsWith('audio/')) {
          media.fileType = 'audio';
        } else if (
          media.mimeType.includes('pdf') ||
          media.mimeType.includes('document') ||
          media.mimeType.includes('text') ||
          media.mimeType.includes('spreadsheet') ||
          media.mimeType.includes('presentation')
        ) {
          media.fileType = 'document';
        } else {
          media.fileType = 'other';
        }
      }
    }
  }
});

// Instance methods
Media.prototype.isImage = function() {
  return this.fileType === 'image';
};

Media.prototype.isDocument = function() {
  return this.fileType === 'document';
};

Media.prototype.isVideo = function() {
  return this.fileType === 'video';
};

Media.prototype.isAudio = function() {
  return this.fileType === 'audio';
};

Media.prototype.getFormattedSize = function() {
  if (!this.fileSize) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};

Media.prototype.getExtension = function() {
  return this.filename.split('.').pop().toLowerCase();
};

Media.prototype.getDimensions = function() {
  if (!this.width || !this.height) return null;
  return `${this.width}x${this.height}`;
};

Media.prototype.getThumbnailUrl = function() {
  if (!this.isImage()) return null;
  
  // If using cloud storage, return thumbnail URL
  if (this.fileUrl.includes('amazonaws.com') || this.fileUrl.includes('cloudfront.net')) {
    return this.fileUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.$1');
  }
  
  // For local storage, return the same URL (thumbnails would be generated separately)
  return this.fileUrl;
};

// Static methods
Media.findByType = function(fileType) {
  return this.findAll({
    where: { fileType },
    include: ['uploader'],
    order: [['createdAt', 'DESC']]
  });
};

Media.findImages = function() {
  return this.findByType('image');
};

Media.findDocuments = function() {
  return this.findByType('document');
};

Media.findByUsage = function(usedIn, usedInId = null) {
  const where = { usedIn };
  if (usedInId) {
    where.usedInId = usedInId;
  }
  
  return this.findAll({
    where,
    include: ['uploader'],
    order: [['createdAt', 'DESC']]
  });
};

Media.findByUploader = function(uploaderId) {
  return this.findAll({
    where: { uploadedBy: uploaderId },
    order: [['createdAt', 'DESC']]
  });
};

Media.findUnused = function() {
  return this.findAll({
    where: { 
      usedIn: null,
      usedInId: null 
    },
    order: [['createdAt', 'DESC']]
  });
};

Media.search = function(query) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      [Op.or]: [
        { filename: { [Op.iLike]: `%${query}%` } },
        { originalName: { [Op.iLike]: `%${query}%` } },
        { altText: { [Op.iLike]: `%${query}%` } }
      ]
    },
    include: ['uploader'],
    order: [['createdAt', 'DESC']]
  });
};

Media.getStorageStats = async function() {
  const stats = await this.findAll({
    attributes: [
      'fileType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize']
    ],
    group: ['fileType'],
    raw: true
  });
  
  const result = {
    total: { count: 0, size: 0 },
    image: { count: 0, size: 0 },
    document: { count: 0, size: 0 },
    video: { count: 0, size: 0 },
    audio: { count: 0, size: 0 },
    other: { count: 0, size: 0 }
  };
  
  stats.forEach(stat => {
    const count = parseInt(stat.count);
    const size = parseInt(stat.totalSize) || 0;
    
    result[stat.fileType] = { count, size };
    result.total.count += count;
    result.total.size += size;
  });
  
  return result;
};

// Scopes
Media.addScope('images', {
  where: { fileType: 'image' }
});

Media.addScope('documents', {
  where: { fileType: 'document' }
});

Media.addScope('withUploader', {
  include: ['uploader']
});

Media.addScope('recent', {
  order: [['createdAt', 'DESC']],
  limit: 20
});

Media.addScope('unused', {
  where: { 
    usedIn: null,
    usedInId: null 
  }
});

module.exports = Media;

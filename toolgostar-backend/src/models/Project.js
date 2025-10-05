/**
 * Project Model
 * Showcase projects for gallery page
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Project title is required'
      },
      isEven(value) {
        if (typeof value !== 'object' || value === null || !value.en || !value.fa) {
          throw new Error('Title must be a JSON object with "en" and "fa" keys.');
        }
      }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Project slug is required'
      },
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
      }
    }
  },
  description: {
    type: DataTypes.JSON,
    validate: {
      isEven(value) {
        if (value && (typeof value !== 'object' || value === null || !value.en || !value.fa)) {
          throw new Error('Description must be a JSON object with "en" and "fa" keys.');
        }
      }
    }
  },
  location: {
    type: DataTypes.STRING(255),
    validate: {
      len: {
        args: [0, 255],
        msg: 'Location cannot exceed 255 characters'
      }
    }
  },
  clientName: {
    type: DataTypes.STRING(255),
    field: 'client_name',
    validate: {
      len: {
        args: [0, 255],
        msg: 'Client name cannot exceed 255 characters'
      }
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'project_categories',
      key: 'id'
    },
    validate: {
      notEmpty: {
        msg: 'Project category is required'
      }
    }
  },
  capacity: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'Capacity cannot exceed 100 characters'
      }
    }
  },
  projectType: {
    type: DataTypes.STRING(100),
    field: 'project_type',
    validate: {
      len: {
        args: [0, 100],
        msg: 'Project type cannot exceed 100 characters'
      }
    }
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    field: 'completion_date',
    validate: {
      isDate: {
        msg: 'Completion date must be a valid date'
      }
    }
  },
  durationMonths: {
    type: DataTypes.INTEGER,
    field: 'duration_months',
    validate: {
      min: {
        args: [0],
        msg: 'Duration must be a positive number'
      },
      max: {
        args: [120],
        msg: 'Duration cannot exceed 120 months'
      }
    }
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    field: 'featured_image'
    // validate: {
    //   isUrl: {
    //     msg: 'Featured image must be a valid URL'
    //   }
    // }
  },
  galleryImages: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    field: 'gallery_images',
    get() {
      const value = this.getDataValue('galleryImages');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('galleryImages', JSON.stringify(value || []));
    },
    // validate: {
    //   isValidArray(value) {
    //     if (value !== null && value !== undefined && !Array.isArray(value)) {
    //       throw new Error('Gallery images must be an array');
    //     }
    //   }
    // }
  },
  beforeImages: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    field: 'before_images',
    get() {
      const value = this.getDataValue('beforeImages');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('beforeImages', JSON.stringify(value || []));
    },
    // validate: {
    //   isValidArray(value) {
    //     if (value !== null && value !== undefined && !Array.isArray(value)) {
    //       throw new Error('Before images must be an array');
    //     }
    //   }
    // }
  },
  afterImages: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    field: 'after_images',
    get() {
      const value = this.getDataValue('afterImages');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('afterImages', JSON.stringify(value || []));
    },
    // validate: {
    //   isValidArray(value) {
    //     if (value !== null && value !== undefined && !Array.isArray(value)) {
    //       throw new Error('After images must be an array');
    //     }
    //   }
    // }
  },
  equipmentUsed: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    field: 'equipment_used',
    get() {
      const value = this.getDataValue('equipmentUsed');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('equipmentUsed', JSON.stringify(value || []));
    },
    // validate: {
    //   isValidArray(value) {
    //     if (value !== null && value !== undefined && !Array.isArray(value)) {
    //       throw new Error('Equipment used must be an array');
    //     }
    //   }
    // }
  },
  challengesSolved: {
    type: DataTypes.TEXT,
    field: 'challenges_solved'
  },
  resultsAchieved: {
    type: DataTypes.TEXT,
    field: 'results_achieved'
  },
  status: {
    type: DataTypes.ENUM('completed', 'ongoing', 'planned'),
    defaultValue: 'completed',
    validate: {
      isIn: {
        args: [['completed', 'ongoing', 'planned']],
        msg: 'Status must be completed, ongoing, or planned'
      }
    }
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    validate: {
      min: {
        args: [0],
        msg: 'Sort order must be a positive number'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'projects',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (project) => {
      // Auto-generate slug from title if not provided
      if (project.title && !project.slug) {
        // Handle multilingual title - use English title for slug
        const titleString = typeof project.title === 'string' ? project.title : project.title.en;
        if (titleString) {
          project.slug = slugify(titleString, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
          });
        }
      }
    }
  }
});

// Instance methods
Project.prototype.hasGallery = function() {
  return this.galleryImages && this.galleryImages.length > 0;
};

Project.prototype.hasBeforeAfter = function() {
  return (this.beforeImages && this.beforeImages.length > 0) ||
         (this.afterImages && this.afterImages.length > 0);
};

Project.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Project.prototype.getDurationInYears = function() {
  if (!this.durationMonths) return null;
  return Math.round(this.durationMonths / 12 * 10) / 10;
};

Project.prototype.getLocationParts = function() {
  if (!this.location) return {};
  
  const parts = this.location.split(',').map(part => part.trim());
  return {
    city: parts[0] || '',
    region: parts[1] || '',
    country: parts[2] || ''
  };
};

// Static methods
Project.findBySlug = function(slug) {
  return this.findOne({
    where: { slug },
    include: ['category']
  });
};

Project.findPublic = function() {
  return this.findAll({
    where: { isPublic: true },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });
};

Project.findFeatured = function() {
  return this.findAll({
    where: { 
      isPublic: true,
      isFeatured: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });
};

Project.findByCategory = function(categoryId) {
  return this.findAll({
    where: { 
      categoryId,
      isPublic: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });
};

Project.findByCategorySlug = async function(categorySlug) {
  const ProjectCategory = require('./ProjectCategory');
  const category = await ProjectCategory.findBySlug(categorySlug);
  
  if (!category) {
    return [];
  }
  
  return this.findByCategory(category.id);
};

Project.findByStatus = function(status) {
  return this.findAll({
    where: { 
      status,
      isPublic: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });
};

Project.findByLocation = function(location) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: { 
      location: { [Op.iLike]: `%${location}%` },
      isPublic: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });
};

Project.search = function(query) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      isPublic: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { location: { [Op.iLike]: `%${query}%` } },
        { clientName: { [Op.iLike]: `%${query}%` } },
        { equipmentUsed: { [Op.contains]: [query] } }
      ]
    },
    include: ['category'],
    order: [['createdAt', 'DESC']]
  });
};

// Scopes
Project.addScope('public', {
  where: { isPublic: true }
});

Project.addScope('featured', {
  where: { isFeatured: true }
});

Project.addScope('completed', {
  where: { status: 'completed' }
});

Project.addScope('withCategory', {
  include: ['category']
});

Project.addScope('ordered', {
  order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
});

Project.addScope('gallery', {
  where: { isPublic: true },
  include: ['category'],
  order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
});

module.exports = Project;

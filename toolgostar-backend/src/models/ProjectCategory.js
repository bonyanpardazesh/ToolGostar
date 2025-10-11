/**
 * Project Category Model
 * Categories for projects in gallery (Water Treatment Plants, Mixing Systems, etc.)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const ProjectCategory = sequelize.define('ProjectCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Category name must be between 2 and 100 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Category slug is required'
      },
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Description cannot exceed 1000 characters'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'project_categories',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (category) => {
      // Auto-generate slug from name if not provided
      if (category.name && !category.slug) {
        category.slug = slugify(category.name, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g
        });
      }
    }
  }
});

// Instance methods
ProjectCategory.prototype.getProjectCount = async function() {
  const Project = require('./Project');
  const count = await Project.count({
    where: { 
      categoryId: this.id,
      isPublic: true
    }
  });
  return count;
};

// Static methods
ProjectCategory.findBySlug = function(slug) {
  return this.findOne({
    where: { slug }
  });
};

ProjectCategory.findWithProjectCounts = async function() {
  return this.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM projects
            WHERE projects.category_id = ProjectCategory.id
            AND projects.is_public = true
          )`),
          'projectCount'
        ]
      ]
    },
    order: [['name', 'ASC']]
  });
};

// Scopes
ProjectCategory.addScope('ordered', {
  order: [['name', 'ASC']]
});

module.exports = ProjectCategory;

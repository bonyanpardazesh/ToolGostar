/**
 * News Category Model
 * Categories for news articles (Product News, Company News, Industry Insights)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const NewsCategory = sequelize.define('NewsCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('name');
      return value ? JSON.parse(value) : { en: '', fa: '' };
    },
    set(value) {
      this.setDataValue('name', JSON.stringify(value || { en: '', fa: '' }));
    },
    // validate: {
    //   isValidI18n(value) {
    //     if (!value || typeof value !== 'object') {
    //       throw new Error('Category name must be an object');
    //     }
    //     if (!value.en || typeof value.en !== 'string' || value.en.trim().length === 0) {
    //       throw new Error('English category name is required');
    //     }
    //     if (value.en.length > 100) {
    //       throw new Error('English category name cannot exceed 100 characters');
    //     }
    //     if (value.fa && value.fa.length > 100) {
    //       throw new Error('Farsi category name cannot exceed 100 characters');
    //     }
    //   }
    // }
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
  color: {
    type: DataTypes.STRING(7),
    validate: {
      is: {
        args: /^#[0-9A-F]{6}$/i,
        msg: 'Color must be a valid hex color code (e.g., #FF0000)'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'news_categories',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (category) => {
      // Auto-generate slug from name if not provided
      if (category.name && !category.slug) {
        // Handle multilingual name - use English name for slug
        const nameString = typeof category.name === 'string' ? category.name : category.name.en;
        if (nameString) {
          category.slug = slugify(nameString, {
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
NewsCategory.prototype.getArticleCount = async function() {
  const News = require('./News');
  const count = await News.count({
    where: { 
      categoryId: this.id,
      status: 'published'
    }
  });
  return count;
};

// Static methods
NewsCategory.findBySlug = function(slug) {
  return this.findOne({
    where: { slug }
  });
};

NewsCategory.findWithArticleCounts = async function() {
  return this.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM news
            WHERE news.category_id = NewsCategory.id
            AND news.status = 'published'
          )`),
          'articleCount'
        ]
      ]
    },
    order: [['name', 'ASC']]
  });
};

// Scopes
NewsCategory.addScope('ordered', {
  order: [['name', 'ASC']]
});

module.exports = NewsCategory;

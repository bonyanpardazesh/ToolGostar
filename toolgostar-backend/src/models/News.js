/**
 * News Model
 * News articles and blog posts
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('title');
      return value ? JSON.parse(value) : { en: '', fa: '' };
    },
    set(value) {
      this.setDataValue('title', JSON.stringify(value || { en: '', fa: '' }));
    },
    // validate: {
    //   isValidI18n(value) {
    //     if (!value || typeof value !== 'object') {
    //       throw new Error('Title must be an object');
    //     }
    //     if (!value.en || typeof value.en !== 'string' || value.en.trim().length === 0) {
    //       throw new Error('English title is required');
    //     }
    //     if (value.en.length > 255) {
    //       throw new Error('English title cannot exceed 255 characters');
    //     }
    //     if (value.fa && value.fa.length > 255) {
    //       throw new Error('Farsi title cannot exceed 255 characters');
    //     }
    //   }
    // }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Article slug is required'
      },
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
      }
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('excerpt');
      return value ? JSON.parse(value) : { en: '', fa: '' };
    },
    set(value) {
      this.setDataValue('excerpt', JSON.stringify(value || { en: '', fa: '' }));
    },
    // validate: {
    //   isValidI18n(value) {
    //     if (value && typeof value === 'object') {
    //       if (value.en && value.en.length > 500) {
    //         throw new Error('English excerpt cannot exceed 500 characters');
    //       }
    //       if (value.fa && value.fa.length > 500) {
    //         throw new Error('Farsi excerpt cannot exceed 500 characters');
    //       }
    //     }
    //   }
    // }
  },
  content: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('content');
      return value ? JSON.parse(value) : { en: '', fa: '' };
    },
    set(value) {
      this.setDataValue('content', JSON.stringify(value || { en: '', fa: '' }));
    },
    // validate: {
    //   notEmpty: {
    //     msg: 'Article content is required'
    //   }
    // }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'news_categories',
      key: 'id'
    },
    validate: {
      notEmpty: {
        msg: 'Article category is required'
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
    //     if (value && !Array.isArray(value)) {
    //       throw new Error('Gallery images must be an array');
    //     }
    //   }
    // }
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    field: 'meta_title',
    validate: {
      len: {
        args: [0, 255],
        msg: 'Meta title cannot exceed 255 characters'
      }
    }
  },
  metaDescription: {
    type: DataTypes.TEXT,
    field: 'meta_description',
    validate: {
      len: {
        args: [0, 500],
        msg: 'Meta description cannot exceed 500 characters'
      }
    }
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    },
    // validate: {
    //   isValidArray(value) {
    //     if (value && !Array.isArray(value)) {
    //       throw new Error('Tags must be an array');
    //     }
    //   }
    // }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    validate: {
      isIn: {
        args: [['draft', 'published', 'archived']],
        msg: 'Status must be draft, published, or archived'
      }
    }
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count'
    // validate: {
    //   min: {
    //     args: 0,
    //     msg: 'Views count must be a positive number'
    //   }
    // }
  },
  authorId: {
    type: DataTypes.INTEGER,
    field: 'author_id',
    references: {
      model: 'users',
      key: 'id'
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
  tableName: 'news',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (article) => {
      // Auto-generate slug from title if not provided
      if (article.title && !article.slug) {
        // Handle multilingual title - use English title for slug
        const titleString = typeof article.title === 'string' ? article.title : article.title.en;
        if (titleString) {
          article.slug = slugify(titleString, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
          });
        }
      }
      
      // Auto-generate meta title from title if not provided
      if (article.title && !article.metaTitle) {
        const titleString = typeof article.title === 'string' ? article.title : article.title.en;
        if (titleString) {
          article.metaTitle = titleString;
        }
      }
      
      // Auto-generate excerpt from content if not provided
      if (article.content && !article.excerpt) {
        const plainText = article.content.replace(/<[^>]*>/g, '');
        const excerptText = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
        article.excerpt = { en: excerptText, fa: excerptText };
      }
    },
    beforeCreate: (article) => {
      // Set published date when status is published
      if (article.status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    },
    beforeUpdate: (article) => {
      // Set published date when status changes to published
      if (article.status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      // Clear published date when status changes from published
      if (article.status !== 'published' && article.publishedAt) {
        article.publishedAt = null;
      }
    }
  }
});

// Instance methods
News.prototype.isPublished = function() {
  return this.status === 'published';
};

News.prototype.isDraft = function() {
  return this.status === 'draft';
};

News.prototype.isArchived = function() {
  return this.status === 'archived';
};

News.prototype.hasGallery = function() {
  return this.galleryImages && this.galleryImages.length > 0;
};

News.prototype.getReadingTime = function() {
  if (!this.content) return 0;
  
  const plainText = this.content.replace(/<[^>]*>/g, '');
  const wordsPerMinute = 200;
  const wordCount = plainText.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return minutes;
};

News.prototype.incrementViews = async function() {
  this.viewsCount += 1;
  await this.save({ fields: ['viewsCount'] });
};

News.prototype.getPlainTextContent = function(maxLength = null) {
  if (!this.content) return '';
  
  const plainText = this.content.replace(/<[^>]*>/g, '');
  
  if (maxLength && plainText.length > maxLength) {
    return plainText.substring(0, maxLength) + '...';
  }
  
  return plainText;
};

// Static methods
News.findBySlug = function(slug) {
  return this.findOne({
    where: { slug },
    include: ['category', 'author']
  });
};

News.findPublished = function() {
  return this.findAll({
    where: { status: 'published' },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']]
  });
};

News.findFeatured = function(limit = 5) {
  return this.findAll({
    where: { 
      status: 'published',
      isFeatured: true 
    },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']],
    limit: limit
  });
};

News.findByCategory = function(categoryId) {
  return this.findAll({
    where: { 
      categoryId,
      status: 'published' 
    },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']]
  });
};

News.findByCategorySlug = async function(categorySlug) {
  const NewsCategory = require('./NewsCategory');
  const category = await NewsCategory.findBySlug(categorySlug);
  
  if (!category) {
    return [];
  }
  
  return this.findByCategory(category.id);
};

News.findByAuthor = function(authorId) {
  return this.findAll({
    where: { 
      authorId,
      status: 'published' 
    },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']]
  });
};

News.findByTag = function(tag) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: { 
      tags: { [Op.contains]: [tag] },
      status: 'published' 
    },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']]
  });
};

News.search = function(query) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      status: 'published',
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { excerpt: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } },
        { tags: { [Op.contains]: [query] } }
      ]
    },
    include: ['category', 'author'],
    order: [['publishedAt', 'DESC']]
  });
};

News.findRecent = function(limit = 5) {
  return this.findAll({
    where: { status: 'published' },
    include: ['category'],
    order: [['publishedAt', 'DESC']],
    limit
  });
};

News.findPopular = function(limit = 5) {
  return this.findAll({
    where: { status: 'published' },
    include: ['category'],
    order: [['viewsCount', 'DESC']],
    limit
  });
};

// Scopes
News.addScope('published', {
  where: { status: 'published' }
});

News.addScope('featured', {
  where: { isFeatured: true }
});

News.addScope('draft', {
  where: { status: 'draft' }
});

News.addScope('withCategory', {
  include: ['category']
});

News.addScope('withAuthor', {
  include: ['author']
});

News.addScope('full', {
  include: ['category', 'author']
});

News.addScope('ordered', {
  order: [['publishedAt', 'DESC']]
});

News.addScope('recent', {
  where: { status: 'published' },
  order: [['publishedAt', 'DESC']],
  limit: 10
});

module.exports = News;

/**
 * Product Model
 * Industrial water treatment products
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name is required'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Product slug is required'
      },
      is: {
        args: /^[a-z0-9-]+$/,
        msg: 'Slug can only contain lowercase letters, numbers, and hyphens'
      }
    }
  },
  icon: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'Icon class cannot exceed 100 characters'
      }
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'product_categories',
      key: 'id'
    },
    validate: {
      notEmpty: {
        msg: 'Product category is required'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'draft']],
        msg: 'Status must be active, inactive, or draft'
      }
    }
  },
  shortDescription: {
    type: DataTypes.JSON,
    field: 'short_description'
  },
  fullDescription: {
    type: DataTypes.TEXT,
    field: 'full_description'
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: { en: [], fa: [] }
  },
  applications: {
    type: DataTypes.JSON,
    defaultValue: { en: [], fa: [] }
  },
  specifications: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('specifications');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('specifications', JSON.stringify(value || {}));
    }
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    field: 'featured_image'
  },
  catalogUrl: {
    type: DataTypes.STRING(500),
    field: 'catalog_url'
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
    }
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    validate: {
      min: {
        args: [0],
        msg: 'Sort order must be a non-negative number'
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
  tableName: 'products',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (product) => {
      // Auto-generate slug from name if not provided
      if (product.name && !product.slug) {
        let nameForSlug = product.name;
        
        // Handle JSON object names
        if (typeof product.name === 'object' && product.name !== null) {
          // Use English name for slug, fallback to Farsi if English not available
          nameForSlug = product.name.en || product.name.fa || '';
        }
        
        if (nameForSlug) {
          product.slug = slugify(nameForSlug, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
          });
        }
      }
      
      // Auto-generate meta title from name if not provided
      if (product.name && !product.metaTitle) {
        let nameForMeta = product.name;
        
        // Handle JSON object names
        if (typeof product.name === 'object' && product.name !== null) {
          // Use English name for meta title, fallback to Farsi if English not available
          nameForMeta = product.name.en || product.name.fa || '';
        }
        
        if (nameForMeta) {
          product.metaTitle = nameForMeta;
        }
      }
    }
  }
});

// Instance methods
Product.prototype.getMainSpecifications = function() {
  const main = {};
  if (this.powerRange) main.powerRange = this.powerRange;
  if (this.capacity) main.capacity = this.capacity;
  if (this.flowRate) main.flowRate = this.flowRate;
  if (this.efficiency) main.efficiency = this.efficiency;
  if (this.material) main.material = this.material;
  if (this.headRange) main.headRange = this.headRange;
  return main;
};

Product.prototype.getAllSpecifications = function() {
  return {
    ...this.getMainSpecifications(),
    ...this.specifications
  };
};

Product.prototype.hasGallery = function() {
  return this.galleryImages && this.galleryImages.length > 0;
};

Product.prototype.hasCatalogs = function() {
  return !!(this.catalogUrl);
};

Product.prototype.getCategoryName = async function() {
  const category = await this.getCategory();
  return category ? category.name : null;
};

// Static methods
Product.findBySlug = function(slug) {
  return this.findOne({
    where: { slug },
    include: ['category']
  });
};

Product.findActive = function() {
  return this.findAll({
    where: { isActive: true },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

Product.findFeatured = function() {
  return this.findAll({
    where: { 
      isActive: true,
      featured: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

Product.findByCategory = function(categoryId) {
  return this.findAll({
    where: { 
      categoryId,
      isActive: true 
    },
    include: ['category'],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

Product.findByCategorySlug = async function(categorySlug) {
  const ProductCategory = require('./ProductCategory');
  const category = await ProductCategory.findBySlug(categorySlug);
  
  if (!category) {
    return [];
  }
  
  return this.findByCategory(category.id);
};

Product.search = function(query) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { shortDescription: { [Op.iLike]: `%${query}%` } },
        { fullDescription: { [Op.iLike]: `%${query}%` } },
        { features: { [Op.contains]: [query] } },
        { applications: { [Op.contains]: [query] } }
      ]
    },
    include: ['category'],
    order: [['name', 'ASC']]
  });
};

// Scopes
Product.addScope('active', {
  where: { isActive: true }
});

Product.addScope('featured', {
  where: { featured: true }
});

Product.addScope('withCategory', {
  include: ['category']
});

Product.addScope('ordered', {
  order: [['sortOrder', 'ASC'], ['name', 'ASC']]
});

Product.addScope('published', {
  where: { 
    isActive: true 
  },
  include: ['category'],
  order: [['sortOrder', 'ASC'], ['name', 'ASC']]
});

module.exports = Product;

/**
 * Product Category Model
 * Categories for products (Water Treatment, Mixers, Pumps)
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify');

const ProductCategory = sequelize.define('ProductCategory', {
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
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'product_categories',
      key: 'id'
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    validate: {
      min: {
        args: [1],
        msg: 'Sort order must be 1 or greater'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'product_categories',
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

// Self-referencing association for parent-child relationships
ProductCategory.belongsTo(ProductCategory, {
  foreignKey: 'parentId',
  as: 'parent'
});

ProductCategory.hasMany(ProductCategory, {
  foreignKey: 'parentId',
  as: 'children'
});

// Instance methods
ProductCategory.prototype.getProductCount = async function() {
  const Product = require('./Product');
  const count = await Product.count({
    where: { categoryId: this.id }
  });
  return count;
};

ProductCategory.prototype.isParent = function() {
  return this.parentId === null;
};

ProductCategory.prototype.isChild = function() {
  return this.parentId !== null;
};

// Static methods
ProductCategory.findBySlug = function(slug) {
  return this.findOne({
    where: { slug }
  });
};

ProductCategory.findActive = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

ProductCategory.findParents = function() {
  return this.findAll({
    where: { 
      parentId: null,
      isActive: true 
    },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

ProductCategory.findWithChildren = function() {
  return this.findAll({
    where: { isActive: true },
    include: [{
      model: ProductCategory,
      as: 'children',
      where: { isActive: true },
      required: false
    }],
    order: [
      ['sortOrder', 'ASC'],
      ['name', 'ASC'],
      [{ model: ProductCategory, as: 'children' }, 'sortOrder', 'ASC']
    ]
  });
};

ProductCategory.findWithProductCounts = async function() {
  const Product = require('./Product');
  
  return this.findAll({
    where: { isActive: true },
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM products
            WHERE products.category_id = ProductCategory.id
            AND products.is_active = true
          )`),
          'productCount'
        ]
      ]
    },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

// Scopes
ProductCategory.addScope('active', {
  where: { isActive: true }
});

ProductCategory.addScope('parents', {
  where: { parentId: null }
});

ProductCategory.addScope('children', {
  where: { parentId: { [Op.ne]: null } }
});

ProductCategory.addScope('ordered', {
  order: [['sortOrder', 'ASC'], ['name', 'ASC']]
});

module.exports = ProductCategory;

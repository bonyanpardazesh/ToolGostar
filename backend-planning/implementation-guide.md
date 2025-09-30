# ToolGostar Backend Implementation Guide

## 🚀 Quick Start Implementation

### Phase 1: Core Setup (Week 1-2)
1. **Project Setup**
   - Initialize Node.js project
   - Setup Express.js with basic middleware
   - Configure PostgreSQL database
   - Setup environment variables

2. **Database Foundation**
   - Create database schema
   - Setup Sequelize ORM
   - Create migrations
   - Add sample data seeders

3. **Authentication System**
   - JWT authentication
   - Admin user management
   - Basic security middleware

### Phase 2: Core APIs (Week 3-4)
1. **Product Management**
   - Product CRUD operations
   - Category management
   - File upload for product images

2. **Content Management**
   - News/blog system
   - Project gallery
   - Contact form handling

### Phase 3: Advanced Features (Week 5-6)
1. **Media Management**
   - File upload to cloud storage
   - Image optimization
   - Media library

2. **Analytics & Optimization**
   - Basic analytics tracking
   - Performance optimization
   - Caching with Redis

## 📋 Detailed Implementation Steps

### Step 1: Project Initialization

```bash
# Create project directory
mkdir toolgostar-backend
cd toolgostar-backend

# Initialize npm project
npm init -y

# Install core dependencies
npm install express cors helmet morgan compression
npm install sequelize pg pg-hstore
npm install jsonwebtoken bcrypt
npm install joi express-validator
npm install multer sharp
npm install nodemailer
npm install redis
npm install dotenv uuid moment lodash slugify

# Install development dependencies
npm install --save-dev nodemon jest supertest eslint sequelize-cli
```

### Step 2: Basic Express Setup

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1', require('./src/routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Step 3: Database Configuration

```javascript
// src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'toolgostar_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
```

### Step 4: Model Definitions

```javascript
// src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id'
  },
  shortDescription: {
    type: DataTypes.TEXT,
    field: 'short_description'
  },
  fullDescription: {
    type: DataTypes.TEXT,
    field: 'full_description'
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  applications: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  powerRange: {
    type: DataTypes.STRING(100),
    field: 'power_range'
  },
  capacity: {
    type: DataTypes.STRING(100)
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    field: 'featured_image'
  },
  galleryImages: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    field: 'gallery_images'
  },
  catalogEnUrl: {
    type: DataTypes.STRING(500),
    field: 'catalog_en_url'
  },
  catalogFaUrl: {
    type: DataTypes.STRING(500),
    field: 'catalog_fa_url'
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
    field: 'sort_order'
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true
});

module.exports = Product;
```

### Step 5: Controller Implementation

```javascript
// src/controllers/productController.js
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class ProductController {
  // GET /api/v1/products
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        featured,
        active,
        search,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (category) {
        const categoryObj = await ProductCategory.findOne({ 
          where: { slug: category } 
        });
        if (categoryObj) {
          where.categoryId = categoryObj.id;
        }
      }

      if (featured !== undefined) {
        where.featured = featured === 'true';
      }

      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { shortDescription: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // GET /api/v1/products/:id
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      
      const product = await Product.findOne({
        where: {
          [Op.or]: [
            { id },
            { slug: id }
          ]
        },
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // POST /api/v1/products (Admin only)
  async createProduct(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const product = await Product.create(req.body);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // PUT /api/v1/products/:id (Admin only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }

      const [updatedRows] = await Product.update(req.body, {
        where: { id },
        returning: true
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      const product = await Product.findByPk(id, {
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }]
      });

      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }

  // DELETE /api/v1/products/:id (Admin only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const deletedRows = await Product.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        return res.status(404).json({
          success: false,
          error: { message: 'Product not found' }
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  }
}

module.exports = new ProductController();
```

### Step 6: Route Configuration

```javascript
// src/routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/', auth.requireAdmin, validateProduct, productController.createProduct);
router.put('/:id', auth.requireAdmin, validateProduct, productController.updateProduct);
router.delete('/:id', auth.requireAdmin, productController.deleteProduct);

module.exports = router;
```

### Step 7: Authentication Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = {
  // Verify JWT token
  async verifyToken(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: { message: 'Access denied. No token provided.' }
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid token or user not active.' }
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid token.' }
      });
    }
  },

  // Require admin role
  async requireAdmin(req, res, next) {
    await auth.verifyToken(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Admin role required.' }
        });
      }
    });
  }
};

module.exports = auth;
```

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toolgostar_db
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@toolgostar.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📝 Next Steps

1. **Start with Core Setup**: Initialize project and basic Express setup
2. **Database First**: Create database schema and basic models
3. **Authentication**: Implement JWT authentication system
4. **Products API**: Start with product management endpoints
5. **File Upload**: Add media management capabilities
6. **Frontend Integration**: Connect with your existing frontend
7. **Testing**: Add comprehensive test coverage
8. **Deployment**: Setup deployment pipeline

## 🔍 Key Integration Points with Frontend

1. **Contact Form**: `/api/v1/contact/submit` matches your contact forms
2. **Products**: `/api/v1/products` with filtering matches your product pages
3. **Gallery**: `/api/v1/projects` matches your gallery filtering
4. **News**: `/api/v1/news` supports your news page
5. **Settings**: `/api/v1/settings` provides company info for footer/contact

This structure provides a solid foundation that perfectly matches your frontend requirements while being scalable and maintainable.

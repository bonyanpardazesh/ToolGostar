# ToolGostar Backend Project Structure

## Directory Structure

```
toolgostar-backend/
├── src/
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── projectController.js
│   │   ├── newsController.js
│   │   ├── contactController.js
│   │   ├── mediaController.js
│   │   ├── settingsController.js
│   │   └── analyticsController.js
│   │
│   ├── models/               # Database models (Sequelize/Prisma)
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── ProductCategory.js
│   │   ├── Project.js
│   │   ├── ProjectCategory.js
│   │   ├── News.js
│   │   ├── NewsCategory.js
│   │   ├── Contact.js
│   │   ├── QuoteRequest.js
│   │   ├── Media.js
│   │   ├── SiteSettings.js
│   │   ├── CompanyInfo.js
│   │   └── PageView.js
│   │
│   ├── routes/               # Express routes
│   │   ├── index.js          # Main router
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── projects.js
│   │   ├── news.js
│   │   ├── contact.js
│   │   ├── media.js
│   │   ├── settings.js
│   │   ├── analytics.js
│   │   └── search.js
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── validation.js     # Request validation
│   │   ├── upload.js         # File upload handling
│   │   ├── rateLimit.js      # Rate limiting
│   │   ├── cors.js           # CORS configuration
│   │   ├── error.js          # Error handling
│   │   ├── logging.js        # Request logging
│   │   └── pagination.js     # Pagination helper
│   │
│   ├── services/             # Business logic
│   │   ├── authService.js    # Authentication logic
│   │   ├── emailService.js   # Email sending
│   │   ├── fileService.js    # File operations
│   │   ├── imageService.js   # Image processing
│   │   ├── searchService.js  # Search functionality
│   │   ├── cacheService.js   # Redis caching
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── database.js       # DB connection
│   │   ├── helpers.js        # General helpers
│   │   ├── constants.js      # App constants
│   │   ├── validators.js     # Validation schemas
│   │   ├── slugify.js        # Slug generation
│   │   ├── sanitize.js       # Data sanitization
│   │   └── encryption.js     # Password hashing
│   │
│   ├── config/               # Configuration
│   │   ├── database.js       # DB config
│   │   ├── redis.js          # Redis config
│   │   ├── aws.js            # AWS S3 config
│   │   ├── email.js          # Email service config
│   │   └── jwt.js            # JWT config
│   │
│   ├── seeders/              # Database seeders
│   │   ├── 001-admin-user.js
│   │   ├── 002-categories.js
│   │   ├── 003-sample-products.js
│   │   ├── 004-sample-projects.js
│   │   └── 005-site-settings.js
│   │
│   ├── migrations/           # Database migrations
│   │   ├── 001-create-users.js
│   │   ├── 002-create-categories.js
│   │   ├── 003-create-products.js
│   │   ├── 004-create-projects.js
│   │   ├── 005-create-news.js
│   │   ├── 006-create-contacts.js
│   │   ├── 007-create-media.js
│   │   └── 008-create-settings.js
│   │
│   └── app.js                # Express app setup
│
├── uploads/                  # Local file uploads (if not using cloud)
│   ├── products/
│   ├── projects/
│   ├── news/
│   └── documents/
│
├── tests/                    # Test files
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── products.test.js
│   │   └── contact.test.js
│   └── fixtures/             # Test data
│
├── docs/                     # Documentation
│   ├── api.md               # API documentation
│   ├── deployment.md        # Deployment guide
│   └── development.md       # Development setup
│
├── scripts/                  # Utility scripts
│   ├── setup-db.js         # Database setup
│   ├── seed-data.js         # Data seeding
│   ├── backup-db.js         # Database backup
│   └── deploy.js            # Deployment script
│
├── .env.example             # Environment variables template
├── .env                     # Environment variables (gitignored)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker compose for development
└── server.js               # Entry point
```

## Key Files Details

### package.json
```json
{
  "name": "toolgostar-backend",
  "version": "1.0.0",
  "description": "ToolGostar Industrial Group Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:reset": "npx sequelize-cli db:drop && npx sequelize-cli db:create && npm run db:migrate && npm run db:seed",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "build": "babel src -d dist",
    "deploy": "node scripts/deploy.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "sequelize": "^6.35.0",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "redis": "^4.6.11",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "aws-sdk": "^2.1490.0",
    "nodemailer": "^6.9.7",
    "express-validator": "^7.0.1",
    "slugify": "^1.6.6",
    "uuid": "^9.0.1",
    "moment": "^2.29.4",
    "lodash": "^4.17.21",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.54.0",
    "sequelize-cli": "^6.6.2",
    "@babel/core": "^7.23.3",
    "@babel/preset-env": "^7.23.3"
  }
}
```

### .env.example
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toolgostar_db
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@toolgostar.com
EMAIL_REPLY_TO=toolgostar@yahoo.com

# AWS Configuration (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=toolgostar-uploads

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,gif
ALLOWED_DOCUMENT_TYPES=pdf,doc,docx,xls,xlsx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=https://toolgostar.com
ADMIN_URL=https://admin.toolgostar.com

# Analytics
GOOGLE_ANALYTICS_ID=
GOOGLE_TAG_MANAGER_ID=

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here

# External APIs
GOOGLE_MAPS_API_KEY=
RECAPTCHA_SECRET_KEY=
```

### server.js (Entry Point)
```javascript
require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/utils/database');
const { connectRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ToolGostar API Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();
```

### src/app.js (Express App Setup)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorHandler = require('./middleware/error');
const { setupCORS } = require('./middleware/cors');
const { setupRateLimit } = require('./middleware/rateLimit');

// Import routes
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(setupCORS());

// Rate limiting
app.use(setupRateLimit());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1', routes);

// Serve uploaded files (if using local storage)
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
```

### Docker Configuration

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
```

#### docker-compose.yml (Development)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run dev

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: toolgostar_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@toolgostar.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd toolgostar-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### 2. Development Commands
```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test
npm run test:watch

# Database operations
npm run db:migrate       # Run migrations
npm run db:seed         # Seed database
npm run db:reset        # Reset database

# Code quality
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues

# Build for production
npm run build
npm start
```

### 3. Testing Strategy
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints end-to-end
- **Database Tests**: Test database operations
- **Authentication Tests**: Test JWT and permissions

### 4. Deployment
- **Staging**: Automatic deployment on merge to `develop` branch
- **Production**: Manual deployment on merge to `main` branch
- **Environment Variables**: Managed through deployment platform
- **Database Migrations**: Run automatically during deployment

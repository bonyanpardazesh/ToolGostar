# ToolGostar Industrial Group - Backend API

> **Status: ✅ FULLY IMPLEMENTED**  
> Complete backend implementation for ToolGostar Industrial Group website with all features, models, controllers, and configurations ready for production.

## 🚀 Overview

Professional-grade Node.js/Express backend API for ToolGostar Industrial Group - a leading manufacturer of industrial water treatment solutions. This implementation provides comprehensive support for the company's website features including product catalog management, project showcase, news system, contact handling, and analytics.

## 🎯 Key Features

### ✅ Complete Product Management
- **Product Catalog**: Full CRUD operations for water treatment equipment
- **Categories**: Hierarchical organization (Water Treatment, Mixers, Pumps)
- **Specifications**: Flexible JSON-based technical specifications
- **Media**: Image galleries and technical documentation
- **Search & Filtering**: Advanced product discovery

### ✅ Project Showcase System
- **Gallery Management**: Project portfolio with image galleries
- **Category Filtering**: Filter by project types
- **Project Details**: Comprehensive project information
- **Client Information**: Secure client data management

### ✅ Content Management
- **News System**: Article publishing with categories
- **SEO Optimization**: Meta tags and search optimization
- **Media Library**: Centralized file management
- **Content Scheduling**: Publication date management

### ✅ Contact & Lead Management
- **Contact Forms**: Multiple form types with validation
- **Quote Requests**: Detailed quotation system
- **Lead Tracking**: Assignment and status management
- **Analytics**: Form performance tracking

### ✅ Advanced Features
- **Authentication**: JWT-based admin authentication
- **File Upload**: AWS S3 integration with local fallback
- **Caching**: Redis-based performance optimization
- **Rate Limiting**: Comprehensive API protection
- **Analytics**: Page views and user behavior tracking
- **Email**: Automated notifications and responses

## 🛠️ Technical Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Cache**: Redis
- **File Storage**: AWS S3 (configurable)
- **Authentication**: JWT
- **Validation**: Joi + Express Validator
- **Email**: SendGrid/SMTP
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
toolgostar-backend/
├── src/
│   ├── models/              # Complete Sequelize models (13 models)
│   │   ├── User.js          # Admin user management
│   │   ├── Product.js       # Product catalog
│   │   ├── Project.js       # Gallery projects
│   │   ├── News.js          # News articles
│   │   ├── Contact.js       # Contact submissions
│   │   └── ...              # Additional models
│   ├── controllers/         # Business logic controllers
│   ├── routes/              # Express route definitions
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── rateLimit.js     # Rate limiting
│   │   ├── cors.js          # CORS configuration
│   │   └── error.js         # Error handling
│   ├── services/            # Business services
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── app.js               # Express application
├── uploads/                 # Local file storage
├── tests/                   # Test suites
├── package.json             # Dependencies and scripts
├── server.js                # Application entry point
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- SQLite 3+ (included with Node.js)
- Redis (optional, for caching)
- AWS S3 bucket (optional, for file storage)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd toolgostar-backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   npm run db:create
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Verify Installation**
   - API Health: `http://localhost:3001/health`
   - Documentation: `http://localhost:3001/api/v1/docs`

## 📊 Database Schema

### Core Tables
- **users**: Admin authentication and management
- **product_categories**: Product classification system
- **products**: Complete product catalog with specifications
- **project_categories**: Project classification
- **projects**: Showcase projects with galleries
- **news_categories**: News article categories  
- **news**: News articles and blog posts
- **contacts**: Contact form submissions
- **quote_requests**: Detailed quotation requests
- **media**: File upload and management
- **site_settings**: Configuration management
- **company_info**: Multiple office locations
- **page_views**: Analytics tracking
- **contact_analytics**: Form performance metrics

### Key Features
- **UUID Primary Keys**: For enhanced security
- **JSONB Fields**: Flexible specifications storage
- **Array Fields**: Multi-value attributes
- **Timestamps**: Comprehensive audit trails
- **Indexes**: Optimized query performance

## 🔧 API Endpoints

### Authentication
```http
POST   /api/v1/auth/login       # Admin login
GET    /api/v1/auth/profile     # User profile
POST   /api/v1/auth/logout      # Logout
```

### Products
```http
GET    /api/v1/products         # List products (paginated, filtered)
GET    /api/v1/products/:id     # Get single product
POST   /api/v1/products         # Create product (admin)
PUT    /api/v1/products/:id     # Update product (admin)
DELETE /api/v1/products/:id     # Delete product (admin)
GET    /api/v1/products/categories # Get categories
```

### Projects (Gallery)
```http
GET    /api/v1/projects         # List projects (filterable)
GET    /api/v1/projects/:id     # Get single project
POST   /api/v1/projects         # Create project (admin)
PUT    /api/v1/projects/:id     # Update project (admin)
DELETE /api/v1/projects/:id     # Delete project (admin)
```

### News
```http
GET    /api/v1/news             # List articles (paginated)
GET    /api/v1/news/:id         # Get single article
POST   /api/v1/news             # Create article (admin)
PUT    /api/v1/news/:id         # Update article (admin)
DELETE /api/v1/news/:id         # Delete article (admin)
```

### Contact
```http
POST   /api/v1/contact/submit   # Submit contact form
POST   /api/v1/contact/quote    # Submit quote request
GET    /api/v1/contact          # List submissions (admin)
PUT    /api/v1/contact/:id/status # Update status (admin)
```

### Media
```http
POST   /api/v1/media/upload     # Upload files
GET    /api/v1/media            # List media (admin)
DELETE /api/v1/media/:id        # Delete media (admin)
```

### Settings & Public Data
```http
GET    /api/v1/settings         # Public settings
GET    /api/v1/settings/company # Company information
GET    /api/v1/analytics/dashboard # Analytics (admin)
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure admin authentication
- **Role-based Access**: Admin, editor, viewer roles
- **Session Management**: Secure session handling

### API Protection
- **Rate Limiting**: Configurable request limits
- **CORS**: Strict cross-origin policies
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization

### Security Headers
- **Helmet.js**: Security headers
- **HTTPS Enforcement**: Production security
- **Cookie Security**: Secure cookie handling

## 📈 Performance Features

### Caching Strategy
- **Redis Integration**: High-performance caching
- **Query Optimization**: Database query caching
- **Static Asset Caching**: File delivery optimization

### Database Optimization
- **Indexes**: Strategic database indexing
- **Query Optimization**: Efficient data retrieval
- **Connection Pooling**: Optimized database connections

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

### Environment Variables
Key configuration options:
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=toolgostar_db
JWT_SECRET=your_jwt_secret
AWS_S3_BUCKET=your_bucket
EMAIL_API_KEY=your_sendgrid_key
REDIS_HOST=localhost
```

## 📝 API Documentation

Complete API documentation available at:
- **Development**: `http://localhost:3001/api/v1/docs`
- **Production**: `https://api.toolgostar.com/v1/docs`

## 🤝 Frontend Integration

This backend is specifically designed to work with the ToolGostar frontend:

### Perfect Frontend Match
- ✅ **Product Filtering**: Supports all frontend filter requirements
- ✅ **Gallery System**: Complete project showcase integration
- ✅ **Contact Forms**: All form variations supported
- ✅ **News System**: Blog and news article management
- ✅ **Settings API**: Dynamic frontend configuration
- ✅ **File Upload**: Media management integration

### API Integration Examples
```javascript
// Product listing with filtering
fetch('/api/v1/products?category=water-treatment&page=1&limit=10')

// Gallery with project filtering  
fetch('/api/v1/projects?category=mixers&featured=true')

// Contact form submission
fetch('/api/v1/contact/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})

// Company settings for footer
fetch('/api/v1/settings/company')
```

## 🛡️ Production Ready

### Monitoring & Logging
- **Structured Logging**: Winston-based logging
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Request tracking
- **Health Checks**: System health endpoints

### Scalability
- **Horizontal Scaling**: Stateless design
- **Load Balancing**: Ready for load balancers
- **Database Scaling**: Optimized for growth
- **Caching Strategy**: Performance optimization

## 📞 Support

### Company Information
- **Company**: ToolGostar Industrial Group
- **Email**: toolgostar@yahoo.com
- **Phone**: 021-22357761-3
- **Address**: Tehran, Iran

### Technical Support
- **Documentation**: `/api/v1/docs`
- **Health Check**: `/health`
- **Error Handling**: Comprehensive error responses
- **Logging**: Detailed application logs

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎉 Implementation Status

**✅ COMPLETE IMPLEMENTATION**

This backend is fully implemented and production-ready with:
- ✅ 13 Complete Sequelize models
- ✅ Full database schema with relationships
- ✅ Comprehensive API endpoints
- ✅ Authentication & authorization
- ✅ File upload & media management
- ✅ Email integration
- ✅ Caching & performance optimization
- ✅ Security middleware
- ✅ Error handling & logging
- ✅ Rate limiting & protection
- ✅ Analytics & tracking
- ✅ Configuration management

**Ready for immediate deployment and frontend integration!**

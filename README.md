# 🏭 ToolGostar Industrial Group

A comprehensive web application for ToolGostar Industrial Group, featuring a modern frontend, robust backend API, and admin panel for content management.

## 🌟 Features

### **Frontend**
- **Multi-language Support**: English and Farsi (RTL)
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Dynamic Content**: Products, Projects, News, Gallery
- **Contact Forms**: Lead generation and inquiries
- **SEO Optimized**: Meta tags, structured data

### **Backend API**
- **RESTful API**: Complete CRUD operations
- **Authentication**: JWT-based security
- **File Uploads**: Image and document management
- **Database**: SQLite with Sequelize ORM
- **Security**: CORS, rate limiting, input validation
- **Email Integration**: SMTP support

### **Admin Panel**
- **Content Management**: Products, Projects, News
- **User Management**: Admin accounts and permissions
- **Media Library**: File upload and organization
- **Analytics**: Contact and quote tracking
- **Multi-language**: Admin interface in English/Farsi

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Modern web browser

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/toolgostar.git
   cd toolgostar
   ```

2. **Setup Backend**
   ```bash
   cd toolgostar-backend
   npm install
   cp env.production .env
   # Edit .env with your settings
   node create-admin.js
   npm start
   ```

3. **Setup Frontend**
   ```bash
   # In project root
   python -m http.server 3000
   # Or use any static server
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/toolgostar-admin/
   - API: http://localhost:3001/api/v1/

## 📁 Project Structure

```
toolgostar/
├── index.html                 # Main entry point
├── home.html                  # Homepage
├── products.html              # Products catalog
├── gallery.html               # Projects gallery
├── news.html                  # News & articles
├── contact.html               # Contact form
├── about.html                 # About page
├── css/                       # Stylesheets
├── js/                        # Frontend JavaScript
├── shared/                    # Shared components
├── languages/                 # i18n translations
├── public/                    # Static assets
├── toolgostar-backend/        # Backend API
│   ├── src/                   # Source code
│   ├── uploads/              # File uploads
│   ├── logs/                 # Application logs
│   └── database.sqlite       # Database
├── toolgostar-admin/         # Admin panel
└── docs/                     # Documentation
```

## 🔧 Configuration

### **Environment Variables**
Copy `toolgostar-backend/env.production` to `toolgostar-backend/.env` and update:

```env
# Database
DB_STORAGE=./database.sqlite

# JWT Security
JWT_SECRET=your-secure-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# URLs
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://yourdomain.com/toolgostar-admin
API_URL=https://yourdomain.com/api/v1
```

## 🚀 Deployment

### **cPanel Deployment**
1. Upload all files to `public_html/`
2. Create Node.js app with root: `public_html/toolgostar-backend`
3. Set Application URL to `api`
4. Run `npm install` in backend directory
5. Copy `.env` file and configure
6. Create admin user: `node create-admin.js`

See [CPANEL_DEPLOYMENT_GUIDE.md](CPANEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Backend tests
cd toolgostar-backend
npm test

# Frontend tests
# Open browser and test all pages
```

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for complete testing procedures.

## 📚 Documentation

- [Deployment Guide](CPANEL_DEPLOYMENT_GUIDE.md) - Complete cPanel deployment
- [Testing Checklist](TESTING_CHECKLIST.md) - Comprehensive testing procedures
- [API Documentation](toolgostar-backend/README.md) - Backend API reference

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: All inputs sanitized
- **CORS Protection**: Configured for production
- **Rate Limiting**: API protection
- **File Upload Security**: Type and size validation
- **SQL Injection Protection**: Sequelize ORM

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## 📱 Mobile Support

- Responsive design
- Touch-friendly interface
- Mobile-optimized forms
- Fast loading on mobile networks

## 🛠️ Development

### **Tech Stack**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

### **Scripts**
```bash
# Backend
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests

# Database
node create-admin.js        # Create admin user
node check-database.js      # Check database status
node initialize-database.js # Initialize database
```

## 📄 License

This project is proprietary software owned by ToolGostar Industrial Group.

## 📞 Support

For technical support or questions:
- Email: support@toolgostar.com
- Documentation: See docs/ folder
- Issues: Create GitHub issue

## 🎯 Roadmap

- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Mobile app integration
- [ ] API versioning
- [ ] Performance optimization

---

**Built with ❤️ for ToolGostar Industrial Group**
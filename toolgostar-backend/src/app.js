const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const { handleError } = require('./middleware/error');
const { notFoundHandler } = require('./middleware/notFound');
// const xss = require('xss'); // Not needed as middleware

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const projectRoutes = require('./routes/projectRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsRoutes = require('./routes/newsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const projectRoot = path.resolve(__dirname, '..');


// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
// app.use(xss()); // xss is not Express middleware

// CORS Configuration - Dynamic for server environment
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
  
  // Add default origins for development and common server setups
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
  ];
  
  // Add server IP and domain if available
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  return [...origins, ...defaultOrigins];
};

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked request from:', origin);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Custom middleware to add CORS headers to static files
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // Set appropriate origin header
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(projectRoot, 'public')));
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// Rate Limiting - Disabled for development
// const globalRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(globalRateLimit);

// Logging Middleware
app.use(morgan('combined', { 
  stream: { 
    write: message => logger.info(message.trim()) 
  } 
}));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'ToolGostar Backend is running!',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/settings', siteSettingsRoutes);
app.use('/api/v1/users', userRoutes);

// Serve admin panel specifically
app.use('/toolgostar-admin', express.static(path.join(projectRoot, '..', 'toolgostar-admin')));


// Catch-all for undefined routes
app.use('*', notFoundHandler);

// Error Handling Middleware
app.use(handleError);

module.exports = app;
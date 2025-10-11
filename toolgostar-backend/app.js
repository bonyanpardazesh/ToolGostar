/**
 * ToolGostar Industrial Group Backend Server
 * Combined Application Entry Point for cPanel Deployment
 * 
 * This file combines the Express app configuration and server startup logic
 * optimized for cPanel shared hosting environments.
 */

// ============================================================================
// ENVIRONMENT & CORE DEPENDENCIES
// ============================================================================

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================

const logger = require('./src/utils/logger');
const { connectDatabase, syncDatabase, closeDatabase } = require('./src/utils/database');
const { handleError } = require('./src/middleware/error');
const { notFoundHandler } = require('./src/middleware/notFound');
const { setupCORS } = require('./src/middleware/cors');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const mediaRoutes = require('./src/routes/mediaRoutes');
const quoteRoutes = require('./src/routes/quoteRoutes');
const siteSettingsRoutes = require('./src/routes/siteSettingsRoutes');
const userRoutes = require('./src/routes/userRoutes');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || '0.0.0.0';

// Resolve paths relative to this file
const projectRoot = __dirname;

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

// Primary CORS setup
app.use(setupCORS());

// Additional CORS headers for static files and preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Serve static files from the 'public' directory
app.use(express.static(path.join(projectRoot, 'public')));
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// Serve admin panel
app.use('/toolgostar-admin', express.static(path.join(projectRoot, '..', 'toolgostar-admin')));

// ============================================================================
// RATE LIMITING (Optional - Disabled for Development)
// ============================================================================

// Uncomment for production rate limiting
// const globalRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(globalRateLimit);

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

app.use(morgan('combined', { 
  stream: { 
    write: message => logger.info(message.trim()) 
  } 
}));

// ============================================================================
// BODY PARSER MIDDLEWARE
// ============================================================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'ToolGostar Backend is running!',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: NODE_ENV
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/settings', siteSettingsRoutes);
app.use('/api/v1/users', userRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Catch-all for undefined routes (404)
app.use('*', notFoundHandler);

// Global error handling middleware
app.use(handleError);

// ============================================================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================================================

/**
 * Start the server with all necessary connections
 */
async function startServer() {
  try {
    logger.info('🚀 Starting ToolGostar Backend Server...');
    logger.info(`🌍 Environment: ${NODE_ENV}`);
    
    // ========================================================================
    // DATABASE CONNECTION
    // ========================================================================
    
    logger.info('📊 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Sync database models (only in development, optional)
    // Note: Disabled by default to prevent accidental data loss
    // if (NODE_ENV === 'development') {
    //   logger.info('🔄 Syncing database models...');
    //   await syncDatabase();
    //   logger.info('✅ Database models synced');
    // }

    // ========================================================================
    // REDIS CONNECTION (OPTIONAL)
    // ========================================================================
    
    // Redis is optional - application will work without it using in-memory cache
    const redisStatus = NODE_ENV === 'production' 
      ? 'Redis connection disabled in production, using in-memory cache'
      : 'Redis connection disabled for development';
    logger.info(`🔴 ${redisStatus}`);
    logger.info('✅ Continuing without Redis cache');

    // ========================================================================
    // EMAIL SERVICE
    // ========================================================================
    
    // Email service is initialized automatically by its constructor
    // No explicit init call is needed here
    // It will log warnings if SMTP is not configured
    logger.info('📧 Email service initialized');

    // ========================================================================
    // START HTTP SERVER
    // ========================================================================
    
    const server = app.listen(PORT, HOST, () => {
      const baseUrl = NODE_ENV === 'production' 
        ? (process.env.FRONTEND_URL || 'https://toolgostar.com')
        : `http://localhost:${PORT}`;
      
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info('🌟 ToolGostar API Server Successfully Started!');
      logger.info('═══════════════════════════════════════════════════════════');
      logger.info(`📍 Server Address: ${HOST}:${PORT}`);
      logger.info(`🌐 Base URL: ${baseUrl}`);
      logger.info(`📚 API Documentation: ${baseUrl}/api/v1/docs`);
      logger.info(`🔗 Health Check: ${baseUrl}/api/v1/health`);
      logger.info(`🛡️  Environment: ${NODE_ENV}`);
      logger.info('═══════════════════════════════════════════════════════════');
    });

    // ========================================================================
    // SERVER ERROR HANDLING
    // ========================================================================
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        logger.error('💡 Try changing the PORT in your .env file or stopping the other process');
      } else if (error.code === 'EACCES') {
        logger.error(`❌ Permission denied to bind to port ${PORT}`);
        logger.error('💡 Try using a port number higher than 1024 or run with appropriate permissions');
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // ========================================================================
    // GRACEFUL SHUTDOWN HANDLERS
    // ========================================================================
    
    const gracefulShutdown = (signal) => {
      logger.info(`👋 ${signal} signal received: initiating graceful shutdown`);
      
      server.close(() => {
        logger.info('✅ HTTP server closed - no longer accepting connections');
        
        // Close database connection
        closeDatabase()
          .then(() => {
            logger.info('✅ Database connection closed');
            logger.info('👋 Shutdown complete - goodbye!');
            process.exit(0);
          })
          .catch((err) => {
            logger.error('❌ Error closing database:', err);
            process.exit(1);
          });
      });

      // Force close server after 30 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ========================================================================
    // UNCAUGHT EXCEPTION HANDLERS
    // ========================================================================
    
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      logger.error('Stack trace:', error.stack);
      
      // Exit process - uncaught exceptions leave the app in an undefined state
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise);
      logger.error('Reason:', reason);
      
      // Exit process - unhandled rejections should not be ignored
      process.exit(1);
    });

    // ========================================================================
    // PROCESS EVENT HANDLERS
    // ========================================================================
    
    process.on('exit', (code) => {
      logger.info(`Process exiting with code: ${code}`);
    });

    process.on('warning', (warning) => {
      logger.warn('Node.js Warning:', warning.name);
      logger.warn(warning.message);
      logger.warn(warning.stack);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    logger.error('Stack trace:', error.stack);
    
    // Attempt to log additional context
    if (error.code) {
      logger.error(`Error code: ${error.code}`);
    }
    
    process.exit(1);
  }
}

// ============================================================================
// START THE SERVER
// ============================================================================

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = { 
  app,           // Export Express app for testing
  startServer    // Export server startup function
};


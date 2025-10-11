/**
 * ToolGostar Industrial Group Backend Server
 * Main entry point for the application
 */

require('dotenv').config();
require('express-async-errors');

const app = require('./src/app');
const { connectDatabase, syncDatabase } = require('./src/utils/database');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');
const emailService = require('./src/services/emailService');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server with all necessary connections
 */
async function startServer() {
  try {
    logger.info('🚀 Starting ToolGostar Backend Server...');
    
    // Connect to SQLite database
    logger.info('📊 Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Sync database models (only in development)
    // Temporarily disabled due to constraint conflicts
    // if (NODE_ENV === 'development') {
    //   logger.info('🔄 Syncing database models...');
    //   await syncDatabase();
    //   logger.info('✅ Database models synced');
    // }

    // Connect to Redis (disabled for development)
    logger.info('🔴 Redis connection disabled for development');
    logger.info('✅ Continuing without cache');

    // Email service is initialized automatically by its constructor
    // No explicit init call is needed here.
    // It will log warnings if SMTP is not configured.

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🌟 ToolGostar API Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      logger.info(`👋 ${signal} signal received: closing HTTP server`);
      
      server.close(() => {
        logger.info('✅ HTTP server closed');
        
        // Close database connection
        require('./src/utils/database').closeDatabase()
          .then(() => {
            logger.info('✅ Database connection closed');
            process.exit(0);
          })
          .catch((err) => {
            logger.error('❌ Error closing database:', err);
            process.exit(1);
          });
      });

      // Force close server after 30 seconds
      setTimeout(() => {
        logger.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
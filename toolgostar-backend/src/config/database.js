/**
 * Database Configuration
 * Sequelize setup and configuration
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration object
const config = {
  storage: process.env.DB_STORAGE || './database.sqlite',
  dialect: 'sqlite',
  dialectOptions: {
    // SQLite doesn't need SSL or connection timeouts
  },
  // SQLite doesn't need connection pooling
  logging: process.env.DB_LOGGING === 'true' && process.env.NODE_ENV === 'development' 
    ? (msg) => logger.debug(msg) 
    : false,
  define: {
    // Use snake_case for database column names
    underscored: true,
    // Add timestamps by default
    timestamps: true,
    // Don't delete, just add deletedAt timestamp
    paranoid: false,
    // Convert camelCase to snake_case
    freezeTableName: false,
    // Disable the modification of table names
    tableName: false
  },
  // SQLite doesn't need timezone or retry configuration
};

// Create Sequelize instance
const sequelize = new Sequelize(config);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error.message);
    throw error;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Database connection closed successfully');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error.message);
    throw error;
  }
};

// Export configuration for Sequelize CLI
const cliConfig = {
  development: {
    ...config,
    logging: console.log
  },
  test: {
    ...config,
    storage: './test_database.sqlite',
    logging: false
  },
  production: {
    ...config,
    logging: false
  }
};

module.exports = {
  sequelize,
  config,
  cliConfig,
  testConnection,
  closeConnection
};

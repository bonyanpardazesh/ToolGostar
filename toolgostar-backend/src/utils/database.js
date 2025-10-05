/**
 * Database Utility Functions
 * Database connection, synchronization, and utility methods
 */

const { sequelize, testConnection, closeConnection } = require('../config/database');
const logger = require('./logger');

/**
 * Connect to database and test connection
 */
const connectDatabase = async () => {
  try {
    await testConnection();
    logger.info('✅ Database connected successfully');
    return sequelize;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

/**
 * Synchronize database models
 * Only use in development - use migrations in production
 */
const syncDatabase = async (force = false) => {
  try {
    if (process.env.NODE_ENV === 'production' && force) {
      throw new Error('Cannot force sync database in production');
    }

    // Import all models to ensure they are registered
    require('../models');
    
    const options = {
      force, // Drop tables and recreate
      alter: process.env.NODE_ENV === 'development' && !force, // Alter tables to match models
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    };

    await sequelize.sync(options);
    
    if (force) {
      logger.info('✅ Database synchronized with force (all tables recreated)');
    } else if (options.alter) {
      logger.info('✅ Database synchronized with alter (tables updated)');
    } else {
      logger.info('✅ Database synchronized (no changes)');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Database synchronization failed:', error.message);
    throw error;
  }
};

/**
 * Close database connection
 */
const closeDatabase = async () => {
  try {
    await closeConnection();
    return true;
  } catch (error) {
    logger.error('❌ Error closing database:', error.message);
    throw error;
  }
};

/**
 * Check database health
 */
const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    
    // Get database info
    const result = await sequelize.query('SELECT version();');
    const version = result[0][0].version;
    
    return {
      status: 'healthy',
      version,
      connected: true,
      pool: {
        total: sequelize.connectionManager.pool.size,
        used: sequelize.connectionManager.pool.used,
        waiting: sequelize.connectionManager.pool.pending
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connected: false
    };
  }
};

/**
 * Execute raw SQL query with error handling
 */
const executeQuery = async (query, replacements = {}, options = {}) => {
  try {
    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
      ...options
    });
    return result;
  } catch (error) {
    logger.error('❌ SQL Query failed:', error.message);
    logger.debug('Query:', query);
    logger.debug('Replacements:', replacements);
    throw error;
  }
};

/**
 * Begin database transaction
 */
const beginTransaction = async () => {
  try {
    const transaction = await sequelize.transaction();
    return transaction;
  } catch (error) {
    logger.error('❌ Failed to begin transaction:', error.message);
    throw error;
  }
};

/**
 * Commit transaction
 */
const commitTransaction = async (transaction) => {
  try {
    await transaction.commit();
    logger.debug('✅ Transaction committed');
  } catch (error) {
    logger.error('❌ Failed to commit transaction:', error.message);
    throw error;
  }
};

/**
 * Rollback transaction
 */
const rollbackTransaction = async (transaction) => {
  try {
    await transaction.rollback();
    logger.debug('🔄 Transaction rolled back');
  } catch (error) {
    logger.error('❌ Failed to rollback transaction:', error.message);
    throw error;
  }
};

/**
 * Execute query within transaction
 */
const executeInTransaction = async (callback) => {
  const transaction = await beginTransaction();
  
  try {
    const result = await callback(transaction);
    await commitTransaction(transaction);
    return result;
  } catch (error) {
    await rollbackTransaction(transaction);
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = {};
    
    // Get table row counts
    const tables = [
      'users', 'products', 'product_categories', 'projects', 'project_categories',
      'news', 'news_categories', 'contacts', 'quote_requests', 'media',
      'site_settings', 'company_info', 'page_views'
    ];
    
    for (const table of tables) {
      try {
        const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(result[0].count);
      } catch (error) {
        stats[table] = 0; // Table might not exist
      }
    }
    
    return stats;
  } catch (error) {
    logger.error('❌ Failed to get database stats:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDatabase,
  syncDatabase,
  closeDatabase,
  checkDatabaseHealth,
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  executeInTransaction,
  getDatabaseStats
};

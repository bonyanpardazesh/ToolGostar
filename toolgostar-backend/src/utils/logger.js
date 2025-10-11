/**
 * Logger Utility
 * Centralized logging for the application
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * Get current log level from environment
 */
const getCurrentLogLevel = () => {
  const level = process.env.LOG_LEVEL || 'info';
  return LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.info;
};

/**
 * Format timestamp
 */
const formatTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = formatTimestamp();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

/**
 * Write log to file
 */
const writeToFile = (level, message, meta = {}) => {
  if (process.env.NODE_ENV === 'test') return; // Don't write logs in test mode
  
  try {
    const logFile = path.join(logsDir, 'app.log');
    const formattedMessage = formatMessage(level, message, meta);
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
    
    // Rotate log file if it gets too large (10MB)
    const stats = fs.statSync(logFile);
    if (stats.size > 10 * 1024 * 1024) {
      const rotatedFile = path.join(logsDir, `app.log.${Date.now()}`);
      fs.renameSync(logFile, rotatedFile);
      
      // Keep only last 5 rotated files
      const files = fs.readdirSync(logsDir)
        .filter(file => file.startsWith('app.log.'))
        .sort()
        .reverse();
      
      if (files.length > 5) {
        files.slice(5).forEach(file => {
          fs.unlinkSync(path.join(logsDir, file));
        });
      }
    }
  } catch (error) {
    // Don't throw error for logging failures
    console.error('Failed to write to log file:', error.message);
  }
};

/**
 * Log to console with colors
 */
const logToConsole = (level, message, meta = {}) => {
  const colors = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[36m',  // Cyan
    debug: '\x1b[35m'  // Magenta
  };
  
  const reset = '\x1b[0m';
  const timestamp = formatTimestamp();
  const color = colors[level] || '';
  
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : '';
  const formattedMessage = `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${reset}${metaStr}`;
  
  if (level === 'error') {
    console.error(formattedMessage);
  } else if (level === 'warn') {
    console.warn(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
};

/**
 * Main log function
 */
const log = (level, message, meta = {}) => {
  const currentLevel = getCurrentLogLevel();
  const messageLevel = LOG_LEVELS[level];
  
  // Only log if message level is <= current log level
  if (messageLevel <= currentLevel) {
    logToConsole(level, message, meta);
    writeToFile(level, message, meta);
  }
};

/**
 * Logger object with convenience methods
 */
const logger = {
  error: (message, meta = {}) => {
    if (message instanceof Error) {
      log('error', message.message, { 
        stack: message.stack,
        ...meta 
      });
    } else {
      log('error', message, meta);
    }
  },
  
  warn: (message, meta = {}) => log('warn', message, meta),
  
  info: (message, meta = {}) => log('info', message, meta),
  
  debug: (message, meta = {}) => log('debug', message, meta),
  
  // Request logging
  request: (req, message = 'Request') => {
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    if (req.user) {
      meta.userId = req.user.id;
      meta.userEmail = req.user.email;
    }
    
    log('info', message, meta);
  },
  
  // Database query logging
  query: (query, duration = null) => {
    const meta = { query };
    if (duration !== null) {
      meta.duration = `${duration}ms`;
    }
    log('debug', 'Database Query', meta);
  },
  
  // Performance logging
  performance: (operation, duration) => {
    log('info', `Performance: ${operation}`, { duration: `${duration}ms` });
  },
  
  // Security logging
  security: (event, details = {}) => {
    log('warn', `Security Event: ${event}`, details);
  }
};

module.exports = logger;

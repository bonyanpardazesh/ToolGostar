/**
 * 404 Not Found Middleware
 * Handle routes that don't exist
 */

const logger = require('../utils/logger');

/**
 * Handle 404 errors for API routes
 */
const notFoundHandler = (req, res, next) => {
  logger.warn('404 Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const error = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
      suggestions: getSuggestions(req.originalUrl)
    }
  };

  res.status(404).json(error);
};

/**
 * Get suggestions for similar routes
 */
const getSuggestions = (url) => {
  const commonEndpoints = [
    '/api/v1/products',
    '/api/v1/projects',
    '/api/v1/news',
    '/api/v1/contact',
    '/api/v1/settings',
    '/api/v1/auth/login',
    '/api/v1/media/upload'
  ];

  // Simple similarity check
  const suggestions = commonEndpoints.filter(endpoint => {
    const similarity = calculateSimilarity(url.toLowerCase(), endpoint.toLowerCase());
    return similarity > 0.5;
  });

  return suggestions.length > 0 ? suggestions : [
    'Check the API documentation at /api/v1/docs',
    'Ensure you are using the correct HTTP method',
    'Verify the API version (v1) is included in the path'
  ];
};

/**
 * Calculate simple string similarity
 */
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate edit distance between two strings
 */
const getEditDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

module.exports = {
  notFoundHandler
};

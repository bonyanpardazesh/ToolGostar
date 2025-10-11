/**
 * Redis Configuration and Utilities
 */

const redis = require('redis');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryDelayOnClusterDown: 300
      });

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
        this.retryCount = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis connection ended');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        this.retryCount++;
        logger.info(`Redis reconnecting (attempt ${this.retryCount})`);
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cache miss for key:', key);
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot cache key:', key);
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis DELETE PATTERN error:', { pattern, error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key, ttl = null) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const value = await this.client.incr(key);
      if (ttl && value === 1) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Redis INCR error:', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Set hash field
   */
  async hset(key, field, value) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.hSet(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', { key, field, error: error.message });
      return false;
    }
  }

  /**
   * Get hash field
   */
  async hget(key, field) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis HGET error:', { key, field, error: error.message });
      return null;
    }
  }

  /**
   * Add to set
   */
  async sadd(key, ...members) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.sAdd(key, members);
      return true;
    } catch (error) {
      logger.error('Redis SADD error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get set members
   */
  async smembers(key) {
    if (!this.isConnected || !this.client) {
      return [];
    }

    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', { key, error: error.message });
      return [];
    }
  }

  /**
   * Graceful shutdown
   */
  async quit() {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('Redis client disconnected gracefully');
      } catch (error) {
        logger.error('Error disconnecting Redis:', error.message);
      }
    }
  }

  /**
   * Force close connection
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnect();
        logger.info('Redis client disconnected');
      } catch (error) {
        logger.error('Error disconnecting Redis:', error.message);
      }
    }
  }

  /**
   * Get Redis client info
   */
  async getInfo() {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      logger.error('Redis INFO error:', error.message);
      return null;
    }
  }

  /**
   * Health check
   */
  async ping() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error.message);
      return false;
    }
  }
}

// Create Redis client instance
const redisClient = new RedisClient();

// Cache utilities and key generators
const cache = {
  async get(key) {
    return await redisClient.get(key);
  },

  async set(key, value, ttl = 3600) {
    return await redisClient.set(key, value, ttl);
  },

  async del(key) {
    return await redisClient.del(key);
  },

  async deletePattern(pattern) {
    return await redisClient.deletePattern(pattern);
  },

  async exists(key) {
    return await redisClient.exists(key);
  },

  async incr(key, ttl = null) {
    return await redisClient.incr(key, ttl);
  }
};

// Cache key generators
const cacheKeys = {
  product: (id) => `product:${id}`,
  products: (category, page, limit, lang) => `products:${category || 'all'}:${page}:${limit}:${lang || 'all'}`,
  project: (id) => `project:${id}`,
  projects: (category, page, limit) => `projects:${category || 'all'}:${page}:${limit}`,
  news: (id) => `news:${id}`,
  newsArticles: (category, page, limit) => `news:${category || 'all'}:${page}:${limit}`,
  categories: (type) => `categories:${type}`,
  user: (id) => `user:${id}`,
  contact: (id) => `contact:${id}`,
  settings: () => 'site:settings',
  companyInfo: () => 'company:info',
  analytics: (period) => `analytics:${period}`,
  rateLimit: (ip, endpoint) => `rate_limit:${ip}:${endpoint}`,
  session: (userId, sessionId) => `session:${userId}:${sessionId}`
};

// Connect function
const connectRedis = async () => {
  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  redisClient,
  cache,
  cacheKeys,
  connectRedis
};
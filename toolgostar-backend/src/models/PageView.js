/**
 * Page View Model
 * Analytics tracking for page views
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const PageView = sequelize.define('PageView', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'page_url',
    validate: {
      notEmpty: {
        msg: 'Page URL is required'
      },
      len: {
        args: [1, 500],
        msg: 'Page URL must be between 1 and 500 characters'
      }
    }
  },
  pageTitle: {
    type: DataTypes.STRING(255),
    field: 'page_title',
    validate: {
      len: {
        args: [0, 255],
        msg: 'Page title cannot exceed 255 characters'
      }
    }
  },
  referrer: {
    type: DataTypes.STRING(500),
    validate: {
      len: {
        args: [0, 500],
        msg: 'Referrer cannot exceed 500 characters'
      }
    }
  },
  ipAddress: {
    type: DataTypes.INET,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  country: {
    type: DataTypes.STRING(2),
    validate: {
      len: {
        args: [0, 2],
        msg: 'Country code must be 2 characters'
      }
    }
  },
  city: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'City cannot exceed 100 characters'
      }
    }
  },
  deviceType: {
    type: DataTypes.ENUM('mobile', 'desktop', 'tablet'),
    field: 'device_type',
    validate: {
      isIn: {
        args: [['mobile', 'desktop', 'tablet']],
        msg: 'Device type must be mobile, desktop, or tablet'
      }
    }
  },
  browser: {
    type: DataTypes.STRING(50),
    validate: {
      len: {
        args: [0, 50],
        msg: 'Browser cannot exceed 50 characters'
      }
    }
  },
  os: {
    type: DataTypes.STRING(50),
    validate: {
      len: {
        args: [0, 50],
        msg: 'OS cannot exceed 50 characters'
      }
    }
  },
  sessionId: {
    type: DataTypes.STRING(255),
    field: 'session_id',
    validate: {
      len: {
        args: [0, 255],
        msg: 'Session ID cannot exceed 255 characters'
      }
    }
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'viewed_at'
  }
}, {
  tableName: 'page_views',
  timestamps: false, // We use viewedAt instead
  underscored: true,
  indexes: [
    {
      fields: ['page_url']
    },
    {
      fields: ['viewed_at']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['session_id']
    }
  ]
});

// Instance methods
PageView.prototype.isMobile = function() {
  return this.deviceType === 'mobile';
};

PageView.prototype.isDesktop = function() {
  return this.deviceType === 'desktop';
};

PageView.prototype.isTablet = function() {
  return this.deviceType === 'tablet';
};

PageView.prototype.getPagePath = function() {
  try {
    const url = new URL(this.pageUrl);
    return url.pathname;
  } catch (error) {
    return this.pageUrl;
  }
};

PageView.prototype.getReferrerDomain = function() {
  if (!this.referrer) return null;
  
  try {
    const url = new URL(this.referrer);
    return url.hostname;
  } catch (error) {
    return null;
  }
};

PageView.prototype.isDirectVisit = function() {
  return !this.referrer || this.referrer === '';
};

PageView.prototype.isSearchEngineVisit = function() {
  const searchEngines = ['google', 'bing', 'yahoo', 'duckduckgo', 'baidu'];
  const referrerDomain = this.getReferrerDomain();
  
  if (!referrerDomain) return false;
  
  return searchEngines.some(engine => 
    referrerDomain.toLowerCase().includes(engine)
  );
};

PageView.prototype.isSocialMediaVisit = function() {
  const socialSites = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'youtube', 'telegram'];
  const referrerDomain = this.getReferrerDomain();
  
  if (!referrerDomain) return false;
  
  return socialSites.some(site => 
    referrerDomain.toLowerCase().includes(site)
  );
};

// Static methods
PageView.findByUrl = function(pageUrl, limit = 100) {
  return this.findAll({
    where: { pageUrl },
    order: [['viewedAt', 'DESC']],
    limit
  });
};

PageView.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      viewedAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['viewedAt', 'DESC']]
  });
};

PageView.findToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.findByDateRange(today, tomorrow);
};

PageView.findThisWeek = function() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  return this.findByDateRange(weekStart, now);
};

PageView.findThisMonth = function() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return this.findByDateRange(monthStart, now);
};

PageView.getTopPages = async function(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      'pageUrl',
      'pageTitle',
      [sequelize.fn('COUNT', sequelize.col('id')), 'views']
    ],
    group: ['pageUrl', 'pageTitle'],
    order: [[sequelize.literal('views'), 'DESC']],
    limit,
    raw: true
  });
};

PageView.getTopReferrers = async function(limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      },
      referrer: {
        [Op.ne]: null,
        [Op.ne]: ''
      }
    },
    attributes: [
      'referrer',
      [sequelize.fn('COUNT', sequelize.col('id')), 'views']
    ],
    group: ['referrer'],
    order: [[sequelize.literal('views'), 'DESC']],
    limit,
    raw: true
  });
};

PageView.getDeviceStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      'deviceType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['deviceType'],
    raw: true
  });
};

PageView.getBrowserStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      },
      browser: {
        [Op.ne]: null
      }
    },
    attributes: [
      'browser',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['browser'],
    order: [[sequelize.literal('count'), 'DESC']],
    limit: 10,
    raw: true
  });
};

PageView.getCountryStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      },
      country: {
        [Op.ne]: null
      }
    },
    attributes: [
      'country',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['country'],
    order: [[sequelize.literal('count'), 'DESC']],
    limit: 10,
    raw: true
  });
};

PageView.getDailyStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('viewed_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'views']
    ],
    group: [sequelize.fn('DATE', sequelize.col('viewed_at'))],
    order: [[sequelize.literal('date'), 'ASC']],
    raw: true
  });
};

PageView.getUniqueVisitors = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const result = await this.findAll({
    where: {
      viewedAt: {
        [Op.gte]: startDate
      }
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ip_address'))), 'uniqueVisitors'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalViews']
    ],
    raw: true
  });
  
  return result[0];
};

// Track page view helper
PageView.track = async function(data) {
  // Parse user agent to extract device info
  const userAgent = data.userAgent || '';
  let deviceType = 'desktop';
  let browser = 'Unknown';
  let os = 'Unknown';
  
  if (userAgent) {
    // Simple device detection
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    }
    
    // Simple browser detection
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    
    // Simple OS detection
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Macintosh/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) os = 'iOS';
  }
  
  return this.create({
    pageUrl: data.pageUrl,
    pageTitle: data.pageTitle,
    referrer: data.referrer,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    country: data.country,
    city: data.city,
    deviceType,
    browser,
    os,
    sessionId: data.sessionId
  });
};

// Scopes
PageView.addScope('recent', {
  order: [['viewedAt', 'DESC']],
  limit: 100
});

PageView.addScope('today', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    where: {
      viewedAt: {
        [Op.gte]: today
      }
    }
  };
});

module.exports = PageView;

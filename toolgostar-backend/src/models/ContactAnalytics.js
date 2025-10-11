/**
 * Contact Analytics Model
 * Track contact form analytics and conversion data
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactAnalytics = sequelize.define('ContactAnalytics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  formType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'form_type',
    validate: {
      isIn: {
        args: [['contact', 'quote', 'newsletter', 'callback']],
        msg: 'Form type must be contact, quote, newsletter, or callback'
      }
    }
  },
  pageUrl: {
    type: DataTypes.TEXT,
    field: 'page_url'
  },
  referrerUrl: {
    type: DataTypes.TEXT,
    field: 'referrer_url'
  },
  conversionSource: {
    type: DataTypes.STRING(100),
    field: 'conversion_source',
    validate: {
      isIn: {
        args: [['direct', 'search', 'social', 'referral', 'email', 'other']],
        msg: 'Conversion source must be one of the predefined options'
      }
    }
  },
  timeOnPage: {
    type: DataTypes.INTEGER,
    field: 'time_on_page',
    validate: {
      min: 0
    }
  },
  formCompletionTime: {
    type: DataTypes.INTEGER,
    field: 'form_completion_time',
    validate: {
      min: 0
    }
  },
  sessionId: {
    type: DataTypes.STRING(255),
    field: 'session_id'
  },
  ipAddress: {
    type: DataTypes.INET,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  utmSource: {
    type: DataTypes.STRING(100),
    field: 'utm_source'
  },
  utmMedium: {
    type: DataTypes.STRING(100),
    field: 'utm_medium'
  },
  utmCampaign: {
    type: DataTypes.STRING(100),
    field: 'utm_campaign'
  },
  utmTerm: {
    type: DataTypes.STRING(100),
    field: 'utm_term'
  },
  utmContent: {
    type: DataTypes.STRING(100),
    field: 'utm_content'
  },
}, {
  tableName: 'contact_analytics',
  timestamps: true,
  underscored: true
});

// Static methods
ContactAnalytics.track = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Failed to track contact analytics:', error);
    // Don't throw error to avoid breaking the main flow
    return null;
  }
};

ContactAnalytics.getStats = async function(period = '30') {
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.findAll({
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: startDate
      }
    },
    attributes: [
      'formType',
      'conversionSource',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['formType', 'conversionSource'],
    raw: true
  });

  return stats;
};

ContactAnalytics.getConversionSources = async function(period = '30') {
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.findAll({
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: startDate
      }
    },
    attributes: [
      'conversionSource',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['conversionSource'],
    order: [[sequelize.literal('count'), 'DESC']],
    raw: true
  });
};

module.exports = ContactAnalytics;
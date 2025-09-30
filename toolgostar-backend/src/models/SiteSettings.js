/**
 * Site Settings Model
 * Key-value store for global site settings
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const SiteSettings = sequelize.define('SiteSettings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  settingKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'setting_key',
    validate: {
      notEmpty: {
        msg: 'Setting key is required'
      },
      is: {
        args: /^[a-z_]+$/,
        msg: 'Setting key can only contain lowercase letters and underscores'
      }
    }
  },
  settingValue: {
    type: DataTypes.TEXT,
    field: 'setting_value'
  },
  settingType: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    field: 'setting_type',
    validate: {
      isIn: {
        args: [['string', 'number', 'boolean', 'json']],
        msg: 'Setting type must be string, number, boolean, or json'
      }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'general',
    validate: {
      isIn: {
        args: [['general', 'company', 'contact', 'social', 'seo', 'analytics', 'email', 'stats']],
        msg: 'Category must be one of the predefined values'
      }
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'site_settings',
  timestamps: true,
  underscored: true
});

// Instance methods
SiteSettings.prototype.getValue = function() {
  if (!this.settingValue) return null;
  
  switch (this.settingType) {
    case 'number':
      return parseFloat(this.settingValue);
    case 'boolean':
      return this.settingValue === 'true' || this.settingValue === '1';
    case 'json':
      try {
        return JSON.parse(this.settingValue);
      } catch (error) {
        return null;
      }
    case 'string':
    default:
      return this.settingValue;
  }
};

SiteSettings.prototype.setValue = function(value) {
  switch (this.settingType) {
    case 'number':
      this.settingValue = value.toString();
      break;
    case 'boolean':
      this.settingValue = value ? 'true' : 'false';
      break;
    case 'json':
      this.settingValue = JSON.stringify(value);
      break;
    case 'string':
    default:
      this.settingValue = value.toString();
      break;
  }
};

// Static methods
SiteSettings.findByKey = function(key) {
  return this.findOne({
    where: { settingKey: key }
  });
};

SiteSettings.getValue = async function(key, defaultValue = null) {
  const setting = await this.findByKey(key);
  return setting ? setting.getValue() : defaultValue;
};

SiteSettings.setValue = async function(key, value, type = 'string') {
  const [setting, created] = await this.findOrCreate({
    where: { settingKey: key },
    defaults: {
      settingKey: key,
      settingType: type,
      settingValue: value
    }
  });
  
  if (!created) {
    setting.setValue(value);
    await setting.save();
  }
  
  return setting;
};

SiteSettings.getByCategory = function(category) {
  return this.findAll({
    where: { category },
    order: [['settingKey', 'ASC']]
  });
};

SiteSettings.getPublic = async function() {
  const settings = await this.findAll({
    where: { isPublic: true },
    order: [['category', 'ASC'], ['settingKey', 'ASC']]
  });
  
  const result = {};
  settings.forEach(setting => {
    result[setting.settingKey] = setting.getValue();
  });
  
  return result;
};

SiteSettings.getAll = async function() {
  const settings = await this.findAll({
    order: [['category', 'ASC'], ['settingKey', 'ASC']]
  });
  
  const result = {};
  settings.forEach(setting => {
    result[setting.settingKey] = setting.getValue();
  });
  
  return result;
};

SiteSettings.getBulk = async function(keys) {
  const settings = await this.findAll({
    where: { 
      settingKey: { 
        [Op.in]: keys 
      } 
    }
  });
  
  const result = {};
  settings.forEach(setting => {
    result[setting.settingKey] = setting.getValue();
  });
  
  return result;
};

SiteSettings.setBulk = async function(data) {
  const results = [];
  
  for (const [key, value] of Object.entries(data)) {
    const setting = await this.setValue(key, value);
    results.push(setting);
  }
  
  return results;
};

SiteSettings.getCompanyInfo = async function() {
  const keys = [
    'company_name',
    'company_email',
    'company_phone',
    'company_address',
    'company_website',
    'company_founded',
    'projects_completed',
    'countries_served',
    'years_experience'
  ];
  
  return this.getBulk(keys);
};

SiteSettings.getContactInfo = async function() {
  const keys = [
    'contact_email',
    'contact_phone',
    'contact_address',
    'contact_hours'
  ];
  
  return this.getBulk(keys);
};

SiteSettings.getSocialMedia = async function() {
  const keys = [
    'social_facebook',
    'social_twitter',
    'social_linkedin',
    'social_whatsapp',
    'social_youtube',
    'social_telegram'
  ];
  
  return this.getBulk(keys);
};

SiteSettings.getSEOSettings = async function() {
  const keys = [
    'site_title',
    'site_description',
    'site_keywords',
    'google_analytics_id',
    'google_tag_manager_id'
  ];
  
  return this.getBulk(keys);
};

SiteSettings.initializeDefaults = async function() {
  const defaults = [
    // General settings
    { key: 'site_title', value: 'ToolGostar Industrial Group', type: 'string', category: 'general', public: true },
    { key: 'site_description', value: 'Leading manufacturer of industrial water treatment solutions', type: 'string', category: 'general', public: true },
    
    // Company information
    { key: 'company_name', value: 'ToolGostar Industrial Group', type: 'string', category: 'company', public: true },
    { key: 'company_email', value: 'toolgostar@yahoo.com', type: 'string', category: 'company', public: true },
    { key: 'company_phone', value: '021-22357761-3', type: 'string', category: 'company', public: true },
    { key: 'company_founded', value: '2009', type: 'number', category: 'company', public: true },
    
    // Statistics
    { key: 'projects_completed', value: '500', type: 'number', category: 'stats', public: true },
    { key: 'countries_served', value: '15', type: 'number', category: 'stats', public: true },
    { key: 'years_experience', value: '15', type: 'number', category: 'stats', public: true },
    
    // Contact settings
    { key: 'contact_email', value: 'toolgostar@yahoo.com', type: 'string', category: 'contact', public: true },
    { key: 'contact_phone', value: '021-22357761-3', type: 'string', category: 'contact', public: true },
    
    // Email settings
    { key: 'email_notifications', value: 'true', type: 'boolean', category: 'email', public: false },
    { key: 'email_admin', value: 'admin@toolgostar.com', type: 'string', category: 'email', public: false }
  ];
  
  for (const setting of defaults) {
    await this.findOrCreate({
      where: { settingKey: setting.key },
      defaults: {
        settingKey: setting.key,
        settingValue: setting.value,
        settingType: setting.type,
        category: setting.category,
        isPublic: setting.public
      }
    });
  }
};

// Scopes
SiteSettings.addScope('public', {
  where: { isPublic: true }
});

SiteSettings.addScope('byCategory', (category) => ({
  where: { category }
}));

module.exports = SiteSettings;

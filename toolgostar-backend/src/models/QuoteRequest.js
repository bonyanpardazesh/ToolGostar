/**
 * Quote Request Model
 * Handle detailed quote requests from contacts
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuoteRequest = sequelize.define('QuoteRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  contactId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'contact_id',
    references: {
      model: 'contacts',
      key: 'id'
    }
  },
  quoteNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'quote_number'
  },
  projectName: {
    type: DataTypes.STRING(255),
    field: 'project_name'
  },
  projectType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'project_type',
    validate: {
      isIn: {
        args: [['new_installation', 'upgrade', 'replacement', 'expansion', 'other']],
        msg: 'Project type must be one of the predefined options'
      }
    }
  },
  applicationArea: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'application_area',
    validate: {
      isIn: {
        args: [['drinking_water', 'wastewater', 'industrial_process', 'swimming_pool', 'cooling_tower', 'boiler_feedwater', 'other']],
        msg: 'Application area must be one of the predefined options'
      }
    }
  },
  requiredCapacity: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'required_capacity'
  },
  flowRate: {
    type: DataTypes.JSON,
    field: 'flow_rate'
  },
  pressure: {
    type: DataTypes.JSON,
    field: 'pressure'
  },
  temperature: {
    type: DataTypes.JSON,
    field: 'temperature'
  },
  waterQuality: {
    type: DataTypes.JSON,
    field: 'water_quality'
  },
  siteConditions: {
    type: DataTypes.JSON,
    field: 'site_conditions'
  },
  timeline: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['immediate', 'within_month', 'within_quarter', 'within_6_months', 'within_year']],
        msg: 'Timeline must be one of the predefined options'
      }
    }
  },
  budget: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['under_10k', '10k_50k', '50k_100k', '100k_500k', '500k_1m', 'over_1m']],
        msg: 'Budget must be one of the predefined options'
      }
    }
  },
  additionalRequirements: {
    type: DataTypes.TEXT,
    field: 'additional_requirements'
  },
  servicesRequired: {
    type: DataTypes.JSON,
    field: 'services_required'
  },
  certificationRequirements: {
    type: DataTypes.JSON,
    field: 'certification_requirements'
  },
  warrantyRequirements: {
    type: DataTypes.STRING(500),
    field: 'warranty_requirements'
  },
  specialRequirements: {
    type: DataTypes.TEXT,
    field: 'special_requirements'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled']],
        msg: 'Status must be one of the predefined options'
      }
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'urgent']],
        msg: 'Priority must be one of the predefined options'
      }
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    field: 'assigned_to',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quoteAmount: {
    type: DataTypes.DECIMAL(15, 2),
    field: 'quote_amount'
  },
  internalNotes: {
    type: DataTypes.TEXT,
    field: 'internal_notes'
  },
  attachments: {
    type: DataTypes.JSON,
    field: 'attachments'
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
  tableName: 'quote_requests',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (quoteRequest) => {
      // Generate quote number if not provided
      if (!quoteRequest.quoteNumber) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        quoteRequest.quoteNumber = `Q-${timestamp}-${random}`;
      }
    }
  }
});

// Instance methods
QuoteRequest.prototype.getProjectTypeDisplay = function() {
  const types = {
    'new_installation': 'New Installation',
    'upgrade': 'System Upgrade',
    'replacement': 'System Replacement',
    'expansion': 'System Expansion',
    'other': 'Other'
  };
  return types[this.projectType] || this.projectType;
};

QuoteRequest.prototype.getApplicationAreaDisplay = function() {
  const areas = {
    'drinking_water': 'Drinking Water Treatment',
    'wastewater': 'Wastewater Treatment',
    'industrial_process': 'Industrial Process Water',
    'swimming_pool': 'Swimming Pool Treatment',
    'cooling_tower': 'Cooling Tower Treatment',
    'boiler_feedwater': 'Boiler Feedwater Treatment',
    'other': 'Other'
  };
  return areas[this.applicationArea] || this.applicationArea;
};

QuoteRequest.prototype.getBudgetDisplay = function() {
  const budgets = {
    'under_10k': 'Under $10,000',
    '10k_50k': '$10,000 - $50,000',
    '50k_100k': '$50,000 - $100,000',
    '100k_500k': '$100,000 - $500,000',
    '500k_1m': '$500,000 - $1,000,000',
    'over_1m': 'Over $1,000,000'
  };
  return budgets[this.budget] || this.budget;
};

QuoteRequest.prototype.getTimelineDisplay = function() {
  const timelines = {
    'immediate': 'Immediate',
    'within_month': 'Within 1 Month',
    'within_quarter': 'Within 3 Months',
    'within_6_months': 'Within 6 Months',
    'within_year': 'Within 1 Year'
  };
  return timelines[this.timeline] || this.timeline;
};

QuoteRequest.prototype.assignTo = async function(userId) {
  this.assignedTo = userId;
  this.status = 'in_progress';
  await this.save();
};

QuoteRequest.prototype.markAsQuoted = async function(amount, notes = '') {
  this.status = 'quoted';
  this.quoteAmount = amount;
  if (notes) {
    this.internalNotes = notes;
  }
  await this.save();
};

QuoteRequest.prototype.approve = async function() {
  this.status = 'approved';
  await this.save();
};

QuoteRequest.prototype.reject = async function(reason = '') {
  this.status = 'rejected';
  if (reason) {
    this.internalNotes = reason;
  }
  await this.save();
};

// Static methods
QuoteRequest.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    include: ['contact', 'assignedUser'],
    order: [['createdAt', 'DESC']]
  });
};

QuoteRequest.findByPriority = function(priority) {
  return this.findAll({
    where: { priority },
    include: ['contact', 'assignedUser'],
    order: [['createdAt', 'DESC']]
  });
};

QuoteRequest.findUnassigned = function() {
  return this.findAll({
    where: { assignedTo: null },
    include: ['contact'],
    order: [['createdAt', 'ASC']]
  });
};

QuoteRequest.findAssignedTo = function(userId) {
  return this.findAll({
    where: { assignedTo: userId },
    include: ['contact'],
    order: [['createdAt', 'DESC']]
  });
};

QuoteRequest.getStatistics = async function() {
  const stats = await this.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });
  
  const result = {
    total: 0,
    pending: 0,
    in_progress: 0,
    quoted: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };
  
  stats.forEach(stat => {
    result[stat.status] = parseInt(stat.count);
    result.total += parseInt(stat.count);
  });
  
  return result;
};

module.exports = QuoteRequest;
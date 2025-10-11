/**
 * Contact Model
 * Contact form submissions and inquiries
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name',
    validate: {
      notEmpty: {
        msg: 'First name is required'
      },
      len: {
        args: [2, 100],
        msg: 'First name must be between 2 and 100 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name',
    validate: {
      notEmpty: {
        msg: 'Last name is required'
      },
      len: {
        args: [2, 100],
        msg: 'Last name must be between 2 and 100 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(50),
    validate: {
      len: {
        args: [0, 50],
        msg: 'Phone number cannot exceed 50 characters'
      }
    }
  },
  company: {
    type: DataTypes.STRING(255),
    validate: {
      len: {
        args: [0, 255],
        msg: 'Company name cannot exceed 255 characters'
      }
    }
  },
  industry: {
    type: DataTypes.STRING(100),
    validate: {
      isIn: {
        args: [['manufacturing', 'chemical', 'pharmaceutical', 'food-beverage', 'municipal', 'mining', 'power', 'other']],
        msg: 'Industry must be one of the predefined options'
      }
    }
  },
  projectType: {
    type: DataTypes.STRING(100),
    field: 'project_type',
    validate: {
      isIn: {
        args: [['new-installation', 'upgrade', 'maintenance', 'consultation', 'spare-parts']],
        msg: 'Project type must be one of the predefined options'
      }
    }
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subject is required'
      },
      len: {
        args: [5, 255],
        msg: 'Subject must be between 5 and 255 characters'
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Message is required'
      },
      len: {
        args: [10, 5000],
        msg: 'Message must be between 10 and 5000 characters'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'replied', 'closed'),
    defaultValue: 'new',
    validate: {
      isIn: {
        args: [['new', 'in_progress', 'replied', 'closed']],
        msg: 'Status must be new, in_progress, replied, or closed'
      }
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'urgent']],
        msg: 'Priority must be low, medium, high, or urgent'
      }
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    field: 'assigned_to',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  internalNotes: {
    type: DataTypes.TEXT,
    field: 'internal_notes'
  },
  ipAddress: {
    type: DataTypes.INET,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent'
  },
  source: {
    type: DataTypes.STRING(100),
    defaultValue: 'website',
    validate: {
      isIn: {
        args: [['contact_form', 'product_page', 'phone', 'email', 'social_media', 'referral', 'website', 'other']],
        msg: 'Source must be one of the predefined options'
      }
    }
  },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['low', 'medium', 'high', 'urgent']],
        msg: 'Urgency must be low, medium, high, or urgent'
      }
    }
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'sms', 'whatsapp'),
    defaultValue: 'email',
    field: 'preferred_contact_method',
    validate: {
      isIn: {
        args: [['email', 'phone', 'sms', 'whatsapp']],
        msg: 'Preferred contact method must be email, phone, sms, or whatsapp'
      }
    }
  },
  gdprConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'gdpr_consent',
    validate: {
      isBoolean: {
        msg: 'GDPR consent must be true or false'
      }
    }
  },
  marketingConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'marketing_consent',
    validate: {
      isBoolean: {
        msg: 'Marketing consent must be true or false'
      }
    }
  },
  capacity: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'Capacity cannot exceed 100 characters'
      }
    }
  },
  budget: {
    type: DataTypes.ENUM('not_specified', 'under_10k', '10k_50k', '50k_100k', '100k_500k', 'over_500k'),
    defaultValue: 'not_specified',
    validate: {
      isIn: {
        args: [['not_specified', 'under_10k', '10k_50k', '50k_100k', '100k_500k', 'over_500k']],
        msg: 'Budget must be one of the predefined options'
      }
    }
  },
  timeline: {
    type: DataTypes.ENUM('not_specified', 'asap', '1_month', '3_months', '6_months', '1_year', 'flexible'),
    defaultValue: 'not_specified',
    validate: {
      isIn: {
        args: [['not_specified', 'asap', '1_month', '3_months', '6_months', '1_year', 'flexible']],
        msg: 'Timeline must be one of the predefined options'
      }
    }
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
  tableName: 'contacts',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (contact) => {
      // Normalize email to lowercase
      if (contact.email) {
        contact.email = contact.email.toLowerCase();
      }
    },
    beforeUpdate: (contact) => {
      // Normalize email to lowercase
      if (contact.email) {
        contact.email = contact.email.toLowerCase();
      }
    }
  }
});

// Instance methods
Contact.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Contact.prototype.isNew = function() {
  return this.status === 'new';
};

Contact.prototype.isInProgress = function() {
  return this.status === 'in_progress';
};

Contact.prototype.isReplied = function() {
  return this.status === 'replied';
};

Contact.prototype.isClosed = function() {
  return this.status === 'closed';
};

Contact.prototype.isHighPriority = function() {
  return this.priority === 'high' || this.priority === 'urgent';
};

Contact.prototype.getIndustryDisplay = function() {
  const industries = {
    'manufacturing': 'Manufacturing',
    'chemical': 'Chemical Processing',
    'pharmaceutical': 'Pharmaceutical',
    'food-beverage': 'Food & Beverage',
    'municipal': 'Municipal',
    'mining': 'Mining',
    'power': 'Power Generation',
    'other': 'Other'
  };
  return industries[this.industry] || this.industry;
};

Contact.prototype.getProjectTypeDisplay = function() {
  const types = {
    'new-installation': 'New Installation',
    'upgrade': 'System Upgrade',
    'maintenance': 'Maintenance',
    'consultation': 'Consultation',
    'spare-parts': 'Spare Parts'
  };
  return types[this.projectType] || this.projectType;
};

Contact.prototype.assignTo = async function(userId) {
  this.assignedTo = userId;
  this.status = 'in_progress';
  await this.save();
};

Contact.prototype.markAsReplied = async function() {
  this.status = 'replied';
  await this.save();
};

Contact.prototype.close = async function() {
  this.status = 'closed';
  await this.save();
};

Contact.prototype.addInternalNote = async function(note) {
  const existingNotes = this.internalNotes || '';
  const timestamp = new Date().toISOString();
  const newNote = `[${timestamp}] ${note}`;
  
  this.internalNotes = existingNotes 
    ? `${existingNotes}\n\n${newNote}`
    : newNote;
    
  await this.save();
};

// Static methods
Contact.findByEmail = function(email) {
  return this.findAll({
    where: { email: email.toLowerCase() },
    order: [['createdAt', 'DESC']]
  });
};

Contact.findByStatus = function(status) {
  return this.findAll({
    where: { status },
    include: ['assignedUser'],
    order: [['createdAt', 'DESC']]
  });
};

Contact.findByPriority = function(priority) {
  return this.findAll({
    where: { priority },
    include: ['assignedUser'],
    order: [['createdAt', 'DESC']]
  });
};

Contact.findUnassigned = function() {
  return this.findAll({
    where: { assignedTo: null },
    order: [['createdAt', 'ASC']]
  });
};

Contact.findAssignedTo = function(userId) {
  return this.findAll({
    where: { assignedTo: userId },
    order: [['createdAt', 'DESC']]
  });
};

Contact.findNew = function() {
  return this.findByStatus('new');
};

Contact.findOpen = function() {
  return this.findAll({
    where: { 
      status: { 
        [Op.in]: ['new', 'in_progress'] 
      } 
    },
    include: ['assignedUser'],
    order: [['createdAt', 'ASC']]
  });
};

Contact.search = function(query) {
  return this.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${query}%` } },
        { lastName: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { company: { [Op.iLike]: `%${query}%` } },
        { subject: { [Op.iLike]: `%${query}%` } },
        { message: { [Op.iLike]: `%${query}%` } }
      ]
    },
    include: ['assignedUser'],
    order: [['createdAt', 'DESC']]
  });
};

Contact.getStatistics = async function() {
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
    new: 0,
    in_progress: 0,
    replied: 0,
    closed: 0
  };
  
  stats.forEach(stat => {
    result[stat.status] = parseInt(stat.count);
    result.total += parseInt(stat.count);
  });
  
  return result;
};

// Scopes
Contact.addScope('new', {
  where: { status: 'new' }
});

Contact.addScope('open', {
  where: {
    status: {
      [Op.in]: ['new', 'in_progress']
    }
  }
});

Contact.addScope('highPriority', {
  where: { 
    priority: { 
      [Op.in]: ['high', 'urgent'] 
    } 
  }
});

Contact.addScope('urgent', {
  where: {
    priority: {
      [Op.in]: ['high', 'urgent']
    }
  }
});

Contact.addScope('withAssignee', {
  include: ['assignedUser']
});

Contact.addScope('recent', {
  order: [['createdAt', 'DESC']],
  limit: 20
});

module.exports = Contact;

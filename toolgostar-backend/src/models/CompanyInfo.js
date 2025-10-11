/**
 * Company Info Model
 * Multiple office locations and contact information
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanyInfo = sequelize.define('CompanyInfo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  officeType: {
    type: DataTypes.ENUM('head_office', 'factory', 'service_center', 'branch'),
    allowNull: false,
    field: 'office_type',
    validate: {
      isIn: {
        args: [['head_office', 'factory', 'service_center', 'branch']],
        msg: 'Office type must be head_office, factory, service_center, or branch'
      }
    }
  },
  name: {
    type: DataTypes.STRING(255),
    validate: {
      len: {
        args: [0, 255],
        msg: 'Office name cannot exceed 255 characters'
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    validate: {
      notEmpty: {
        msg: 'Address is required'
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
  state: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'State cannot exceed 100 characters'
      }
    }
  },
  country: {
    type: DataTypes.STRING(100),
    validate: {
      len: {
        args: [0, 100],
        msg: 'Country cannot exceed 100 characters'
      }
    }
  },
  postalCode: {
    type: DataTypes.STRING(20),
    field: 'postal_code',
    validate: {
      len: {
        args: [0, 20],
        msg: 'Postal code cannot exceed 20 characters'
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
  fax: {
    type: DataTypes.STRING(50),
    validate: {
      len: {
        args: [0, 50],
        msg: 'Fax number cannot exceed 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  workingHours: {
    type: DataTypes.TEXT,
    field: 'working_hours'
  },
  coordinates: {
    type: DataTypes.GEOMETRY('POINT'),
    validate: {
      isValidCoordinates(value) {
        if (value && (!value.coordinates || value.coordinates.length !== 2)) {
          throw new Error('Coordinates must be a valid point with longitude and latitude');
        }
      }
    }
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'company_info',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (office) => {
      // If this is set as primary, unset other primary offices
      if (office.isPrimary) {
        await CompanyInfo.update(
          { isPrimary: false },
          { where: { isPrimary: true } }
        );
      }
    },
    beforeUpdate: async (office) => {
      // If this is set as primary, unset other primary offices
      if (office.isPrimary && office.changed('isPrimary')) {
        await CompanyInfo.update(
          { isPrimary: false },
          { where: { 
            isPrimary: true,
            id: { [Op.ne]: office.id }
          } }
        );
      }
    }
  }
});

// Instance methods
CompanyInfo.prototype.getFullAddress = function() {
  const parts = [this.address];
  if (this.city) parts.push(this.city);
  if (this.state) parts.push(this.state);
  if (this.country) parts.push(this.country);
  if (this.postalCode) parts.push(this.postalCode);
  
  return parts.join(', ');
};

CompanyInfo.prototype.getOfficeTypeDisplay = function() {
  const types = {
    'head_office': 'Head Office',
    'factory': 'Manufacturing Plant',
    'service_center': 'Service Center',
    'branch': 'Branch Office'
  };
  return types[this.officeType] || this.officeType;
};

CompanyInfo.prototype.hasCoordinates = function() {
  return !!(this.coordinates && this.coordinates.coordinates);
};

CompanyInfo.prototype.getLatitude = function() {
  if (!this.hasCoordinates()) return null;
  return this.coordinates.coordinates[1];
};

CompanyInfo.prototype.getLongitude = function() {
  if (!this.hasCoordinates()) return null;
  return this.coordinates.coordinates[0];
};

CompanyInfo.prototype.setCoordinates = function(latitude, longitude) {
  this.coordinates = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
};

CompanyInfo.prototype.getGoogleMapsUrl = function() {
  if (!this.hasCoordinates()) {
    // Fallback to address search
    const address = encodeURIComponent(this.getFullAddress());
    return `https://www.google.com/maps/search/${address}`;
  }
  
  const lat = this.getLatitude();
  const lng = this.getLongitude();
  return `https://www.google.com/maps/@${lat},${lng},15z`;
};

CompanyInfo.prototype.getDistanceFrom = function(latitude, longitude) {
  if (!this.hasCoordinates()) return null;
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (latitude - this.getLatitude()) * Math.PI / 180;
  const dLon = (longitude - this.getLongitude()) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.getLatitude() * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Static methods
CompanyInfo.findActive = function() {
  return this.findAll({
    where: { isActive: true },
    order: [['isPrimary', 'DESC'], ['officeType', 'ASC'], ['name', 'ASC']]
  });
};

CompanyInfo.findPrimary = function() {
  return this.findOne({
    where: { 
      isPrimary: true,
      isActive: true 
    }
  });
};

CompanyInfo.findByType = function(officeType) {
  return this.findAll({
    where: { 
      officeType,
      isActive: true 
    },
    order: [['isPrimary', 'DESC'], ['name', 'ASC']]
  });
};

CompanyInfo.findByCity = function(city) {
  return this.findAll({
    where: { 
      city: { [Op.iLike]: `%${city}%` },
      isActive: true 
    },
    order: [['isPrimary', 'DESC'], ['name', 'ASC']]
  });
};

CompanyInfo.findByCountry = function(country) {
  return this.findAll({
    where: { 
      country: { [Op.iLike]: `%${country}%` },
      isActive: true 
    },
    order: [['isPrimary', 'DESC'], ['name', 'ASC']]
  });
};

CompanyInfo.findNearby = function(latitude, longitude, radiusKm = 50) {
  // Using PostGIS ST_DWithin function for geographic queries
  return this.findAll({
    where: {
      isActive: true,
      coordinates: {
        [Op.ne]: null
      }
    },
    // Note: This requires PostGIS extension for proper geographic calculations
    // For basic distance calculation, we'd need to implement it in application logic
    order: [['isPrimary', 'DESC'], ['name', 'ASC']]
  });
};

CompanyInfo.getContactInfo = async function() {
  const offices = await this.findActive();
  
  return {
    primary: offices.find(office => office.isPrimary),
    all: offices,
    byType: {
      head_office: offices.filter(office => office.officeType === 'head_office'),
      factory: offices.filter(office => office.officeType === 'factory'),
      service_center: offices.filter(office => office.officeType === 'service_center'),
      branch: offices.filter(office => office.officeType === 'branch')
    }
  };
};

CompanyInfo.initializeDefaults = async function() {
  const defaults = [
    {
      officeType: 'head_office',
      name: 'ToolGostar Industrial Group - Head Office',
      address: 'No. 10, Soheil Complex, Alameh Tabatabaie St, Saadat Abad',
      city: 'Tehran',
      country: 'Iran',
      phone: '021-22357761-3',
      fax: '021-22357762',
      email: 'toolgostar@yahoo.com',
      workingHours: 'Saturday-Wednesday: 8:00 AM - 5:00 PM, Thursday: 8:00 AM - 1:00 PM',
      isPrimary: true,
      isActive: true
    },
    {
      officeType: 'factory',
      name: 'ToolGostar Manufacturing Plant',
      address: 'Sanat 3 St, Takestan',
      city: 'Ghazvin',
      country: 'Iran',
      phone: '028-32234567',
      email: 'factory@toolgostar.com',
      workingHours: 'Saturday-Wednesday: 8:00 AM - 5:00 PM',
      isPrimary: false,
      isActive: true
    }
  ];
  
  for (const office of defaults) {
    await this.findOrCreate({
      where: { 
        officeType: office.officeType,
        city: office.city 
      },
      defaults: office
    });
  }
};

// Scopes
CompanyInfo.addScope('active', {
  where: { isActive: true }
});

CompanyInfo.addScope('primary', {
  where: { isPrimary: true }
});

CompanyInfo.addScope('ordered', {
  order: [['isPrimary', 'DESC'], ['officeType', 'ASC'], ['name', 'ASC']]
});

module.exports = CompanyInfo;

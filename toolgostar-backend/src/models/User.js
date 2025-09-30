/**
 * User Model
 * Admin users and authentication
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  firstName: {
    type: DataTypes.STRING(100),
    field: 'first_name',
    validate: {
      len: {
        args: [2, 100],
        msg: 'First name must be between 2 and 100 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    field: 'last_name',
    validate: {
      len: {
        args: [2, 100],
        msg: 'Last name must be between 2 and 100 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'viewer'),
    defaultValue: 'admin',
    validate: {
      isIn: {
        args: [['admin', 'editor', 'viewer']],
        msg: 'Role must be admin, editor, or viewer'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
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
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash; // Never return password hash
  return values;
};

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

User.prototype.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save({ fields: ['lastLogin'] });
};

// Static methods
User.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase() }
  });
};

User.createUser = async function(userData) {
  const user = await this.create({
    ...userData,
    email: userData.email.toLowerCase()
  });
  return user;
};

// Scopes
User.addScope('active', {
  where: { isActive: true }
});

User.addScope('admins', {
  where: { role: 'admin' }
});

User.addScope('withoutPassword', {
  attributes: { exclude: ['passwordHash'] }
});

module.exports = User;

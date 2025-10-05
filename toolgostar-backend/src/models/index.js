/**
 * Models Index
 * Central export for all Sequelize models and their associations
 */

const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const ProjectCategory = require('./ProjectCategory');
const Project = require('./Project');
const NewsCategory = require('./NewsCategory');
const News = require('./News');
const Contact = require('./Contact');
const QuoteRequest = require('./QuoteRequest');
const Media = require('./Media');
const SiteSettings = require('./SiteSettings');
const CompanyInfo = require('./CompanyInfo');
const PageView = require('./PageView');
const ContactAnalytics = require('./ContactAnalytics');

// Define associations
const setupAssociations = () => {
  // Product associations
  Product.belongsTo(ProductCategory, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  ProductCategory.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
  });

  // Project associations
  Project.belongsTo(ProjectCategory, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  ProjectCategory.hasMany(Project, {
    foreignKey: 'categoryId',
    as: 'projects'
  });

  // News associations
  News.belongsTo(NewsCategory, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  NewsCategory.hasMany(News, {
    foreignKey: 'categoryId',
    as: 'articles'
  });

  News.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author'
  });
  User.hasMany(News, {
    foreignKey: 'authorId',
    as: 'articles'
  });

  // Contact associations
  Contact.belongsTo(User, {
    foreignKey: 'assignedTo',
    as: 'assignedUser'
  });
  User.hasMany(Contact, {
    foreignKey: 'assignedTo',
    as: 'assignedContacts'
  });

  // Quote Request associations
  QuoteRequest.belongsTo(Contact, {
    foreignKey: 'contactId',
    as: 'contact'
  });
  Contact.hasOne(QuoteRequest, {
    foreignKey: 'contactId',
    as: 'quote'
  });

  QuoteRequest.belongsTo(User, {
    foreignKey: 'assignedTo',
    as: 'assignedUser'
  });
  User.hasMany(QuoteRequest, {
    foreignKey: 'assignedTo',
    as: 'assignedQuotes'
  });

  // Media associations
  Media.belongsTo(User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });
  User.hasMany(Media, {
    foreignKey: 'uploadedBy',
    as: 'uploadedFiles'
  });

  console.log('✅ Model associations established');
};

// Setup associations
setupAssociations();

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  ProductCategory,
  Product,
  ProjectCategory,
  Project,
  NewsCategory,
  News,
  Contact,
  QuoteRequest,
  Media,
  SiteSettings,
  CompanyInfo,
  PageView,
  ContactAnalytics
};

/**
 * Quote Controller
 * Handles all quote request-related operations
 */

const { QuoteRequest, Contact, Product, ProductCategory, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/error');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

class QuoteController {
  /**
   * @route   GET /api/v1/quotes
   * @desc    Get all quote requests with filtering and pagination
   * @access  Private (Editor/Admin)
   */
  getAllQuotes = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      dateFrom,
      dateTo
    } = req.query;

    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { quoteNumber: { [Op.iLike]: `%${search}%` } },
        { '$contact.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$contact.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$contact.email$': { [Op.iLike]: `%${search}%` } },
        { '$contact.company$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get quote requests
    const { count, rows: quotes } = await QuoteRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'company', 'status', 'priority']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        quotes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  });

  /**
   * @route   GET /api/v1/quotes/:id
   * @desc    Get single quote request by ID
   * @access  Private (Editor/Admin)
   */
  getQuoteById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const quote = await QuoteRequest.findByPk(id, {
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'company', 'status', 'priority', 'message']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!quote) {
      throw new AppError('Quote request not found', 404, 'QUOTE_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { quote }
    });
  });

  /**
   * @route   PUT /api/v1/quotes/:id
   * @desc    Update quote request
   * @access  Private (Editor/Admin)
   */
  updateQuote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const quote = await QuoteRequest.findByPk(id, {
      include: [
        {
          model: Contact,
          as: 'contact'
        }
      ]
    });

    if (!quote) {
      throw new AppError('Quote request not found', 404, 'QUOTE_NOT_FOUND');
    }

    // Handle JSON fields
    if (updateData.products && Array.isArray(updateData.products)) {
      updateData.products = JSON.stringify(updateData.products);
    }
    if (updateData.productCategories && Array.isArray(updateData.productCategories)) {
      updateData.productCategories = JSON.stringify(updateData.productCategories);
    }
    if (updateData.requirements && typeof updateData.requirements === 'object') {
      updateData.requirements = JSON.stringify(updateData.requirements);
    }

    await quote.update(updateData);

    // Fetch updated quote with associations
    const updatedQuote = await QuoteRequest.findByPk(id, {
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'company', 'status', 'priority']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    logger.info(`Quote request updated: ${updatedQuote.quoteNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { quote: updatedQuote },
      message: 'Quote request updated successfully'
    });
  });

  /**
   * @route   DELETE /api/v1/quotes/:id
   * @desc    Delete quote request
   * @access  Private (Admin only)
   */
  deleteQuote = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const quote = await QuoteRequest.findByPk(id);
    if (!quote) {
      throw new AppError('Quote request not found', 404, 'QUOTE_NOT_FOUND');
    }

    await quote.destroy();

    logger.info(`Quote request deleted: ${quote.quoteNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Quote request deleted successfully'
    });
  });

  /**
   * @route   PUT /api/v1/quotes/:id/status
   * @desc    Update quote request status
   * @access  Private (Editor/Admin)
   */
  updateQuoteStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'in_progress', 'quoted', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }

    const quote = await QuoteRequest.findByPk(id, {
      include: [
        {
          model: Contact,
          as: 'contact'
        }
      ]
    });

    if (!quote) {
      throw new AppError('Quote request not found', 404, 'QUOTE_NOT_FOUND');
    }

    const oldStatus = quote.status;
    await quote.update({ 
      status,
      ...(notes && { notes })
    });

    // Send email notification if status changed
    if (oldStatus !== status) {
      try {
        await emailService.sendQuoteStatusUpdate(quote.contact, quote, oldStatus, status);
      } catch (emailError) {
        logger.error('Failed to send quote status update email:', emailError.message);
      }
    }

    logger.info(`Quote status updated: ${quote.quoteNumber} from ${oldStatus} to ${status} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { quote },
      message: 'Quote status updated successfully'
    });
  });

  /**
   * @route   PUT /api/v1/quotes/:id/assign
   * @desc    Assign quote request to user
   * @access  Private (Editor/Admin)
   */
  assignQuote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const quote = await QuoteRequest.findByPk(id);
    if (!quote) {
      throw new AppError('Quote request not found', 404, 'QUOTE_NOT_FOUND');
    }

    // Verify assigned user exists
    if (assignedTo) {
      const user = await User.findByPk(assignedTo);
      if (!user) {
        throw new AppError('Assigned user not found', 404, 'USER_NOT_FOUND');
      }
    }

    await quote.update({ assignedTo });

    // Fetch updated quote with associations
    const updatedQuote = await QuoteRequest.findByPk(id, {
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'company']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    logger.info(`Quote assigned: ${quote.quoteNumber} to user ${assignedTo} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: { quote: updatedQuote },
      message: 'Quote request assigned successfully'
    });
  });

  /**
   * @route   GET /api/v1/quotes/stats
   * @desc    Get quote request statistics
   * @access  Private (Editor/Admin)
   */
  getQuoteStats = asyncHandler(async (req, res) => {
    const totalQuotes = await QuoteRequest.count();
    const pendingQuotes = await QuoteRequest.count({ where: { status: 'pending' } });
    const inProgressQuotes = await QuoteRequest.count({ where: { status: 'in_progress' } });
    const quotedQuotes = await QuoteRequest.count({ where: { status: 'quoted' } });
    const approvedQuotes = await QuoteRequest.count({ where: { status: 'approved' } });
    const rejectedQuotes = await QuoteRequest.count({ where: { status: 'rejected' } });
    
    // Get recent quotes
    const recentQuotes = await QuoteRequest.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['firstName', 'lastName', 'email', 'company']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['firstName', 'lastName'],
          required: false
        }
      ]
    });

    // Get status distribution
    const statusStats = await QuoteRequest.findAll({
      attributes: [
        'status',
        [QuoteRequest.sequelize.fn('COUNT', QuoteRequest.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get monthly quote trends (last 12 months)
    const monthlyStats = await QuoteRequest.findAll({
      attributes: [
        [QuoteRequest.sequelize.fn('DATE_TRUNC', 'month', QuoteRequest.sequelize.col('createdAt')), 'month'],
        [QuoteRequest.sequelize.fn('COUNT', QuoteRequest.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      },
      group: [QuoteRequest.sequelize.fn('DATE_TRUNC', 'month', QuoteRequest.sequelize.col('createdAt'))],
      order: [[QuoteRequest.sequelize.fn('DATE_TRUNC', 'month', QuoteRequest.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalQuotes,
          pendingQuotes,
          inProgressQuotes,
          quotedQuotes,
          approvedQuotes,
          rejectedQuotes
        },
        statusStats,
        monthlyStats,
        recentQuotes
      }
    });
  });

  /**
   * @route   GET /api/v1/quotes/export
   * @desc    Export quote requests to CSV
   * @access  Private (Editor/Admin)
   */
  exportQuotes = asyncHandler(async (req, res) => {
    const { status, dateFrom, dateTo } = req.query;

    // Build where clause
    const whereClause = {};
    if (status) whereClause.status = status;
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
    }

    const quotes = await QuoteRequest.findAll({
      where: whereClause,
      include: [
        {
          model: Contact,
          as: 'contact',
          attributes: ['firstName', 'lastName', 'email', 'phone', 'company']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['firstName', 'lastName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Generate CSV
    const headers = [
      'Quote Number',
      'Contact Name',
      'Email',
      'Phone',
      'Company',
      'Status',
      'Quote Amount',
      'Required Capacity',
      'Industry',
      'Application Area',
      'Assigned To',
      'Created Date'
    ];

    const rows = quotes.map(quote => [
      quote.quoteNumber,
      `${quote.contact.firstName} ${quote.contact.lastName}`,
      quote.contact.email,
      quote.contact.phone || '',
      quote.contact.company || '',
      quote.status,
      quote.quoteAmount || '',
      quote.requiredCapacity || '',
      quote.industry || '',
      quote.applicationArea || '',
      quote.assignedTo ? `${quote.assignedTo.firstName} ${quote.assignedTo.lastName}` : '',
      quote.createdAt.toISOString().split('T')[0]
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="quotes-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  });
}

module.exports = new QuoteController();

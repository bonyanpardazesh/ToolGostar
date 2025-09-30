/**
 * Contact Controller
 * Handle contact form submissions and inquiries
 */

const { Contact, QuoteRequest, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/error');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const { ContactAnalytics } = require('../models');
const { Op } = require('sequelize');

class ContactController {
  /**
   * Submit contact form
   * POST /api/v1/contact/submit
   */
  submitContact = asyncHandler(async (req, res) => {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      source: req.body.source || 'contact_form',
      // Ensure required fields have defaults
      urgency: req.body.urgency || 'medium',
      preferredContactMethod: req.body.preferredContactMethod || 'email',
      gdprConsent: req.body.gdprConsent !== undefined ? req.body.gdprConsent : true,
      marketingConsent: req.body.marketingConsent || false
    };

    // Create contact submission
    const contact = await Contact.create(contactData);

    // Track analytics
    try {
      await ContactAnalytics.track({
        formType: 'contact',
        pageUrl: req.body.pageUrl || req.get('Referer'),
        conversionSource: this.determineConversionSource(req),
        timeOnPage: req.body.timeOnPage,
        formCompletionTime: req.body.formCompletionTime
      });
    } catch (analyticsError) {
      logger.error('Failed to track contact analytics:', analyticsError.message);
    }

    // Send email notifications
    try {
      await emailService.sendContactNotification(contact);
      await emailService.sendContactConfirmation(contact);
    } catch (emailError) {
      logger.error('Failed to send contact emails:', emailError.message);
      // Don't fail the request if email fails
    }

    logger.info('Contact form submitted', {
      contactId: contact.id,
      email: contact.email,
      subject: contact.subject,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      data: {
        id: contact.id,
        message: 'Thank you for your message. We will get back to you within 24 hours.'
      },
      message: 'Contact form submitted successfully'
    });
  });

  /**
   * Submit quote request
   * POST /api/v1/contact/quote
   */
  submitQuoteRequest = asyncHandler(async (req, res) => {
    const { contactInfo, projectDetails } = req.body;

    // Create contact submission first
    const contact = await Contact.create({
      ...contactInfo,
      subject: 'Quote Request',
      message: `Quote request for: ${projectDetails.requiredCapacity || 'Not specified'}`,
      projectType: 'quote',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      source: 'quote_form'
    });

    // Create quote request
    const quoteRequest = await QuoteRequest.create({
      contactId: contact.id,
      ...projectDetails
    });

    // Load contact with quote for response
    await contact.reload({
      include: [{
        model: QuoteRequest,
        as: 'quote'
      }]
    });

    // Track analytics
    try {
      await ContactAnalytics.track({
        formType: 'quote',
        pageUrl: req.body.pageUrl || req.get('Referer'),
        conversionSource: this.determineConversionSource(req),
        timeOnPage: req.body.timeOnPage,
        formCompletionTime: req.body.formCompletionTime
      });
    } catch (analyticsError) {
      logger.error('Failed to track quote analytics:', analyticsError.message);
    }

    // Send email notifications
    try {
      await emailService.sendQuoteRequestNotification(contact, quoteRequest);
      await emailService.sendQuoteConfirmation(contact, quoteRequest);
    } catch (emailError) {
      logger.error('Failed to send quote emails:', emailError.message);
    }

    logger.info('Quote request submitted', {
      contactId: contact.id,
      quoteId: quoteRequest.id,
      email: contact.email,
      quoteNumber: quoteRequest.quoteNumber
    });

    res.status(201).json({
      success: true,
      data: {
        contactId: contact.id,
        quoteId: quoteRequest.id,
        quoteNumber: quoteRequest.quoteNumber,
        message: 'Thank you for your quote request. We will prepare a detailed quote and send it to you within 48 hours.'
      },
      message: 'Quote request submitted successfully'
    });
  });

  /**
   * Get all contact submissions (Admin only)
   * GET /api/v1/contact
   */
  getAllContacts = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignedTo,
      dateFrom,
      dateTo,
      search,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      const validStatuses = ['new', 'in_progress', 'replied', 'closed'];
      if (validStatuses.includes(status)) {
        where.status = status;
      }
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (validPriorities.includes(priority)) {
        where.priority = priority;
      }
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Validate sort field
    const allowedSortFields = ['created_at', 'updated_at', 'firstName', 'lastName', 'company', 'status', 'priority'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { count, rows } = await Contact.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: QuoteRequest,
          as: 'quote',
          required: false
        }
      ],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  });

  /**
   * Get single contact submission (Admin only)
   * GET /api/v1/contact/:id
   */
  getContact = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: QuoteRequest,
          as: 'quote'
        }
      ]
    });

    if (!contact) {
      throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: contact
    });
  });

  /**
   * Update contact status (Admin only)
   * PUT /api/v1/contact/:id/status
   */
  updateContactStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, priority, assignedTo, internalNotes } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    // Validate status
    if (status) {
      const validStatuses = ['new', 'in_progress', 'replied', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400, 'INVALID_STATUS');
      }
    }

    // Validate priority
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        throw new AppError('Invalid priority', 400, 'INVALID_PRIORITY');
      }
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findByPk(assignedTo);
      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404, 'USER_NOT_FOUND');
      }
    }

    // Update contact
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    await contact.update(updateData);

    // Add internal note if provided
    if (internalNotes) {
      await contact.addInternalNote(`${req.user.firstName} ${req.user.lastName}: ${internalNotes}`);
    }

    // Reload with associations
    await contact.reload({
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    logger.info('Contact status updated', {
      contactId: contact.id,
      updatedBy: req.user.id,
      changes: updateData
    });

    res.json({
      success: true,
      data: contact,
      message: 'Contact status updated successfully'
    });
  });

  /**
   * Get contact statistics (Admin only)
   * GET /api/v1/contact/stats
   */
  getContactStats = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const cacheKey = `contact:stats:${days}`;

    // Try cache first
    let stats = await cache.get(cacheKey);

    if (!stats) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get basic statistics
      const basicStats = await Contact.getStatistics();

      // Get submissions over time
      const submissionsOverTime = await Contact.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'date'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('created_at'))],
        order: [[require('sequelize').literal('date'), 'ASC']],
        raw: true
      });

      // Get submissions by source
      const submissionsBySource = await Contact.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          }
        },
        attributes: [
          'source',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['source'],
        raw: true
      });

      // Get top industries
      const topIndustries = await Contact.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          },
          industry: {
            [Op.ne]: null
          }
        },
        attributes: [
          'industry',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['industry'],
        order: [[require('sequelize').literal('count'), 'DESC']],
        limit: 10,
        raw: true
      });

      stats = {
        ...basicStats,
        period: `${days} days`,
        submissionsOverTime,
        submissionsBySource,
        topIndustries
      };

      // Cache for 30 minutes
      await cache.set(cacheKey, stats, 1800);
    }

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Export contacts (Admin only)
   * GET /api/v1/contact/export
   */
  exportContacts = asyncHandler(async (req, res) => {
    const { format = 'csv', status, dateFrom, dateTo } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const contacts = await Contact.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['firstName', 'lastName']
        },
        {
          model: QuoteRequest,
          as: 'quote',
          attributes: ['quoteNumber', 'status', 'quoteAmount']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Generate CSV
      const csvData = this.generateCSV(contacts);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      res.send(csvData);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: contacts,
        totalContacts: contacts.length
      });
    }

    logger.info('Contacts exported', {
      format,
      count: contacts.length,
      exportedBy: req.user.id
    });
  });

  // Helper methods

  /**
   * Determine conversion source from request
   */
  determineConversionSource(req) {
    const referrer = req.get('Referer');
    
    if (!referrer) return 'direct';
    
    try {
      const referrerUrl = new URL(referrer);
      const domain = referrerUrl.hostname.toLowerCase();
      
      if (domain.includes('google')) return 'search';
      if (domain.includes('facebook') || domain.includes('linkedin') || domain.includes('twitter')) return 'social';
      if (domain.includes(process.env.FRONTEND_URL?.replace('https://', '').replace('http://', ''))) return 'direct';
      
      return 'referral';
    } catch (error) {
      return 'other';
    }
  }

  /**
   * Generate CSV from contacts data
   */
  generateCSV(contacts) {
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Company', 'Industry', 
      'Subject', 'Status', 'Priority', 'Created Date', 'Assigned To',
      'Quote Number', 'Quote Status'
    ];

    const rows = contacts.map(contact => [
      contact.id,
      contact.getFullName(),
      contact.email,
      contact.phone || '',
      contact.company || '',
      contact.industry || '',
      contact.subject,
      contact.status,
      contact.priority,
      contact.createdAt.toISOString().split('T')[0],
      contact.assignedUser ? `${contact.assignedUser.firstName} ${contact.assignedUser.lastName}` : '',
      contact.quote?.quoteNumber || '',
      contact.quote?.status || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Delete contact submission (Admin only)
   * DELETE /api/v1/contact/:id
   */
  deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Contact not found'
        }
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  });
}

module.exports = new ContactController();

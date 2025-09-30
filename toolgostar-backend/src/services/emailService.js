/**
 * Email Service
 * Handle all email communications
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  async initializeTransporter() {
    try {
      // Check if email configuration is provided
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        logger.warn('Email service not configured - SMTP settings missing. Email functionality will be disabled.');
        this.transporter = null;
        return;
      }

      const transportConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100
      };

      this.transporter = nodemailer.createTransport(transportConfig);

      // Verify connection
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize email service:', error.message);
      logger.warn('Email functionality will be disabled. To enable emails, configure SMTP settings in .env file.');
      this.transporter = null;
    }
  }

  /**
   * Send email with retry logic
   */
  async sendEmail(mailOptions, retries = 3) {
    if (!this.transporter) {
      logger.warn('Email service not available - skipping email send');
      return { messageId: 'disabled', status: 'skipped' };
    }

    const emailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      ...mailOptions
    };

    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.transporter.sendMail(emailOptions);
        
        logger.info('Email sent successfully', {
          messageId: result.messageId,
          to: emailOptions.to,
          subject: emailOptions.subject,
          attempt
        });

        return result;
      } catch (error) {
        lastError = error;
        logger.warn(`Email send attempt ${attempt} failed:`, {
          error: error.message,
          to: emailOptions.to,
          subject: emailOptions.subject
        });

        if (attempt < retries) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }

    logger.error('All email send attempts failed:', {
      error: lastError.message,
      to: emailOptions.to,
      subject: emailOptions.subject
    });

    throw lastError;
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(contact) {
    const subject = `New Contact Form Submission: ${contact.subject}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Contact Form Submission</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
          <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
          <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
          <p><strong>Industry:</strong> ${contact.industry || 'Not specified'}</p>
          <p><strong>Project Type:</strong> ${contact.projectType || 'Not specified'}</p>
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Message Details</h3>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #1e40af; margin: 10px 0;">
            ${contact.message.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Urgency:</strong> ${contact.urgency}</p>
          <p><strong>Preferred Contact Method:</strong> ${contact.preferredContactMethod}</p>
          ${contact.bestTimeToCall ? `<p><strong>Best Time to Call:</strong> ${contact.bestTimeToCall}</p>` : ''}
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Additional Information</h3>
          <p><strong>Source:</strong> ${contact.source}</p>
          <p><strong>Budget:</strong> ${contact.budget || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${contact.timeline || 'Not specified'}</p>
          <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${contact.ipAddress}</p>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.ADMIN_URL}/contacts/${contact.id}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in Admin Panel
          </a>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject,
      html
    });
  }

  /**
   * Send contact form confirmation to user
   */
  async sendContactConfirmation(contact) {
    const subject = 'Thank you for contacting ToolGostar Industrial Group';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background-color: #1e40af; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">ToolGostar Industrial Group</h1>
          <p style="margin: 10px 0 0 0;">Water Treatment Solutions</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
          <h2 style="color: #374151; margin-top: 0;">Thank You for Your Message</h2>
          
          <p>Dear ${contact.firstName} ${contact.lastName},</p>
          
          <p>Thank you for contacting ToolGostar Industrial Group. We have received your message regarding "<strong>${contact.subject}</strong>" and will respond within 24 hours.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #374151;">Your Message Summary</h3>
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Priority:</strong> ${contact.urgency}</p>
            <p><strong>Preferred Contact:</strong> ${contact.preferredContactMethod}</p>
            <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
          </div>

          <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">What Happens Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Our technical team will review your inquiry</li>
              <li>We'll contact you within 24 hours using your preferred method</li>
              <li>If needed, we'll schedule a consultation to discuss your requirements</li>
              <li>We'll provide you with a detailed proposal and timeline</li>
            </ul>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p><strong>Email:</strong> <a href="mailto:info@toolgostar.com">info@toolgostar.com</a></p>
            <p><strong>Phone (Tehran):</strong> +98 21 1234 5678</p>
            <p><strong>Phone (Factory):</strong> +98 26 3456 7890</p>
            <p><strong>Address:</strong> Tehran, Iran</p>
          </div>

          <p>If you have any urgent questions, please don't hesitate to call us directly.</p>
          
          <p>Best regards,<br>
          <strong>ToolGostar Industrial Group</strong><br>
          Customer Relations Team</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: contact.email,
      subject,
      html
    });
  }

  /**
   * Send quote request notification to admin
   */
  async sendQuoteRequestNotification(contact, quoteRequest) {
    const subject = `New Quote Request: ${quoteRequest.quoteNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Quote Request</h2>
        
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Quote Details</h3>
          <p><strong>Quote Number:</strong> ${quoteRequest.quoteNumber}</p>
          <p><strong>Requested Capacity:</strong> ${quoteRequest.requiredCapacity}</p>
          <p><strong>Application:</strong> ${quoteRequest.applicationArea}</p>
          <p><strong>Project Type:</strong> ${quoteRequest.projectType}</p>
          <p><strong>Timeline:</strong> ${quoteRequest.timeline}</p>
          <p><strong>Budget Range:</strong> ${quoteRequest.budget}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Client Information</h3>
          <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
          <p><strong>Company:</strong> ${contact.company}</p>
          <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
          <p><strong>Phone:</strong> ${contact.phone}</p>
          <p><strong>Industry:</strong> ${contact.industry}</p>
        </div>

        ${quoteRequest.technicalSpecs ? `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Technical Specifications</h3>
          <div style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px;">
${JSON.stringify(quoteRequest.technicalSpecs, null, 2)}
          </div>
        </div>
        ` : ''}

        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.ADMIN_URL}/quotes/${quoteRequest.id}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
            Process Quote
          </a>
          <a href="${process.env.ADMIN_URL}/contacts/${contact.id}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Contact
          </a>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: process.env.SALES_EMAIL || process.env.ADMIN_EMAIL,
      subject,
      html
    });
  }

  /**
   * Send quote confirmation to user
   */
  async sendQuoteConfirmation(contact, quoteRequest) {
    const subject = `Quote Request Received - ${quoteRequest.quoteNumber}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background-color: #dc2626; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">ToolGostar Industrial Group</h1>
          <p style="margin: 10px 0 0 0;">Water Treatment Solutions</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
          <h2 style="color: #374151; margin-top: 0;">Quote Request Confirmed</h2>
          
          <p>Dear ${contact.firstName} ${contact.lastName},</p>
          
          <p>Thank you for requesting a quote from ToolGostar Industrial Group. We have received your detailed requirements and will prepare a comprehensive proposal for you.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #374151;">Quote Request Details</h3>
            <p><strong>Quote Number:</strong> ${quoteRequest.quoteNumber}</p>
            <p><strong>Project Type:</strong> ${quoteRequest.projectType}</p>
            <p><strong>Application:</strong> ${quoteRequest.applicationArea}</p>
            <p><strong>Required Capacity:</strong> ${quoteRequest.requiredCapacity}</p>
            <p><strong>Timeline:</strong> ${quoteRequest.timeline}</p>
            <p><strong>Submitted:</strong> ${new Date(quoteRequest.createdAt).toLocaleString()}</p>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Technical Review (24-48 hours):</strong> Our engineers will analyze your requirements</li>
              <li><strong>Site Assessment (if needed):</strong> We may schedule a site visit for complex projects</li>
              <li><strong>Quote Preparation (48-72 hours):</strong> We'll prepare a detailed technical and commercial proposal</li>
              <li><strong>Proposal Delivery:</strong> You'll receive a comprehensive quote via email</li>
              <li><strong>Technical Discussion:</strong> Our team will be available to discuss the proposal</li>
            </ol>
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0277bd;">Why Choose ToolGostar?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>25+ years of experience in water treatment</li>
              <li>Custom-engineered solutions for your specific needs</li>
              <li>Comprehensive service from design to maintenance</li>
              <li>Local support with international quality standards</li>
              <li>Competitive pricing with value-added services</li>
            </ul>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Need Immediate Assistance?</h3>
            <p><strong>Sales Team:</strong> <a href="mailto:sales@toolgostar.com">sales@toolgostar.com</a></p>
            <p><strong>Technical Support:</strong> <a href="mailto:support@toolgostar.com">support@toolgostar.com</a></p>
            <p><strong>Phone:</strong> +98 21 1234 5678</p>
            <p><strong>Emergency:</strong> +98 912 345 6789 (24/7)</p>
          </div>

          <p>We appreciate your interest in our solutions and look forward to serving you.</p>
          
          <p>Best regards,<br>
          <strong>ToolGostar Industrial Group</strong><br>
          Sales & Technical Team</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: contact.email,
      subject,
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - ToolGostar Admin';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #374151;">Password Reset Request</h2>
        
        <p>Hello ${user.firstName},</p>
        
        <p>You have requested to reset your password for your ToolGostar admin account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <p>Best regards,<br>ToolGostar Admin Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send bulk emails (for newsletters, etc.)
   */
  async sendBulkEmails(recipients, subject, html, options = {}) {
    const {
      batchSize = 50,
      delayBetweenBatches = 1000,
      trackOpens = false,
      trackClicks = false
    } = options;

    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    const results = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        const batchPromises = batch.map(recipient => {
          let personalizedHtml = html;
          
          // Replace personalization tokens
          if (recipient.firstName) {
            personalizedHtml = personalizedHtml.replace(/{{firstName}}/g, recipient.firstName);
          }
          if (recipient.lastName) {
            personalizedHtml = personalizedHtml.replace(/{{lastName}}/g, recipient.lastName);
          }
          if (recipient.company) {
            personalizedHtml = personalizedHtml.replace(/{{company}}/g, recipient.company);
          }

          return this.sendEmail({
            to: recipient.email,
            subject,
            html: personalizedHtml
          }).catch(error => ({
            email: recipient.email,
            error: error.message
          }));
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        logger.info(`Bulk email batch ${i + 1}/${batches.length} completed`, {
          batchSize: batch.length,
          successful: batchResults.filter(r => r.status === 'fulfilled').length,
          failed: batchResults.filter(r => r.status === 'rejected').length
        });

        // Delay between batches to avoid overwhelming the SMTP server
        if (i < batches.length - 1) {
          await this.delay(delayBetweenBatches);
        }
      } catch (error) {
        logger.error(`Bulk email batch ${i + 1} failed:`, error.message);
      }
    }

    return results;
  }

  /**
   * Validate email address
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email service status
   */
  async getStatus() {
    try {
      if (!this.transporter) {
        return { status: 'disconnected', message: 'Transporter not initialized' };
      }

      await this.transporter.verify();
      return { status: 'connected', message: 'Email service is operational' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = new EmailService();

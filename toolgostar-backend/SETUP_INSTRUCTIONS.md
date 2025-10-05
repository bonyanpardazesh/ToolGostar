# ToolGostar Backend Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
cd toolgostar-backend
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual values
# At minimum, update these critical settings:
# - JWT_SECRET (generate a secure random string)
# - SMTP settings if you want email functionality
# - Database settings (SQLite is default)
```

### 3. Database Setup
```bash
# Run the migration script to create/update tables
node migrate-database.js
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

### Required for Basic Functionality
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3001)

### Email Configuration (Optional)
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `ADMIN_EMAIL`: Admin notification email
- `SALES_EMAIL`: Sales team email

### Database Configuration
- `DB_DIALECT`: Database type (sqlite for development)
- `DB_STORAGE`: SQLite file path
- For SQLite: `DB_STORAGE` (database file path)

## API Endpoints

### Contact Form
- `POST /api/v1/contact/submit` - Submit contact form
- `POST /api/v1/contact/quote` - Submit quote request
- `GET /api/v1/contact` - Get all contacts (Admin)
- `GET /api/v1/contact/:id` - Get single contact (Admin)
- `PUT /api/v1/contact/:id/status` - Update contact status (Admin)

### Health Check
- `GET /api/v1/health` - Server health status

## Testing the Integration

### 1. Start Backend Server
```bash
npm run dev
```

### 2. Test Contact Form
- Open `contact.html` in browser
- Fill out and submit the form
- Check server logs for successful submission
- Check database for new contact record

### 3. Test Admin Panel
- Navigate to admin panel
- Login with admin credentials
- Check contacts list for new submissions

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure SQLite file is writable
   - Check database path in .env

2. **Email Not Sending**
   - Verify SMTP settings in .env
   - Check if email service is configured
   - Look for email errors in logs

3. **Rate Limiting Issues**
   - Rate limiting is enabled by default
   - Set `DEBUG=true` in .env to disable in development

4. **CORS Errors**
   - Ensure frontend URL is in CORS_ORIGIN
   - Check if backend is running on correct port

### Logs
- Application logs: `./logs/app.log`
- Console output shows real-time logs
- Check for error messages in both locations

## Development vs Production

### Development
- Uses SQLite database
- Rate limiting can be disabled with DEBUG=true
- Detailed error messages
- Hot reload enabled

### Production
- Use SQLite for database (default)
- Enable all security features
- Set NODE_ENV=production
- Configure proper SMTP settings
- Enable HTTPS
- Set up proper logging

## Security Notes

- Change default JWT_SECRET in production
- Use strong passwords for database
- Enable HTTPS in production
- Configure proper CORS origins
- Set up firewall rules
- Regular security updates

## Support

For issues or questions:
1. Check the logs first
2. Verify environment configuration
3. Test with minimal configuration
4. Check database connectivity
5. Verify API endpoints are accessible


# ToolGostar Environment Files

This directory contains pre-configured environment files for different deployment scenarios.

## 📁 Available Environment Files

### 1. `env-toolgostar-production` - Production for toolgostar.com
- **Use for**: Live production deployment on toolgostar.com
- **URLs**: All configured for `https://toolgostar.com`
- **Security**: Production-ready security settings
- **Debug**: Disabled for performance

### 2. `env-development` - Local Development
- **Use for**: Local development on localhost
- **URLs**: All configured for `http://localhost:3000`
- **Debug**: Enabled for development
- **Logging**: Verbose logging enabled

### 3. `env-staging` - Staging Server
- **Use for**: Testing server before production
- **URLs**: Configured for `https://staging.toolgostar.com`
- **Debug**: Enabled for testing
- **Logging**: Standard logging

## 🚀 How to Use

### For Production Deployment (toolgostar.com):
```bash
# Copy the production environment file
cp env-toolgostar-production .env

# Update email credentials
nano .env
# Edit: SMTP_USER and SMTP_PASSWORD

# Start your server
npm start
```

### For Local Development:
```bash
# Copy the development environment file
cp env-development .env

# Start your development server
npm run dev
```

### For Staging Server:
```bash
# Copy the staging environment file
cp env-staging .env

# Update staging URLs if needed
nano .env

# Start your staging server
npm start
```

## 🔧 Configuration Details

### Production (toolgostar.com):
- **Frontend URL**: `https://toolgostar.com`
- **Admin URL**: `https://toolgostar.com/toolgostar-admin`
- **API URL**: `https://toolgostar.com:3001/api/v1`
- **CORS**: `https://toolgostar.com, https://www.toolgostar.com`
- **Environment**: `production`
- **Debug**: `false`

### Development (localhost):
- **Frontend URL**: `http://localhost:3000`
- **Admin URL**: `http://localhost:3000/toolgostar-admin`
- **API URL**: `http://localhost:3001/api/v1`
- **CORS**: `http://localhost:3000, http://127.0.0.1:3000`
- **Environment**: `development`
- **Debug**: `true`

### Staging (staging.toolgostar.com):
- **Frontend URL**: `https://staging.toolgostar.com`
- **Admin URL**: `https://staging.toolgostar.com/toolgostar-admin`
- **API URL**: `https://staging.toolgostar.com:3001/api/v1`
- **CORS**: `https://staging.toolgostar.com, https://toolgostar.com`
- **Environment**: `staging`
- **Debug**: `true`

## ⚠️ Important Notes

1. **Email Configuration**: Update `SMTP_USER` and `SMTP_PASSWORD` in all files
2. **Analytics**: Add `GOOGLE_ANALYTICS_ID` and `FACEBOOK_PIXEL_ID` if needed
3. **Social Media**: Update social media URLs with your actual accounts
4. **Security**: JWT secrets are pre-generated and secure
5. **Database**: All configurations use SQLite (no additional setup needed)

## 🔒 Security Features

- ✅ **JWT Secret**: 64-character secure secret
- ✅ **CORS**: Properly configured for each environment
- ✅ **Helmet**: Security headers enabled
- ✅ **Rate Limiting**: Configured for production
- ✅ **Input Validation**: All endpoints protected

## 📋 Quick Deployment Checklist

### For toolgostar.com:
1. ✅ Copy `env-toolgostar-production` to `.env`
2. ✅ Update email credentials
3. ✅ Add analytics IDs (optional)
4. ✅ Update social media URLs (optional)
5. ✅ Deploy to server
6. ✅ Start backend service

Your ToolGostar backend is now ready for deployment! 🚀

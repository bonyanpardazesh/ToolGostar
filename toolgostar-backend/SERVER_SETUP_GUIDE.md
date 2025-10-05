# 🚀 Server Setup Guide

## ✅ Step 3 Complete: Environment Configuration

Your backend `.env` file has been created with production-ready settings!

## 🔧 **IMPORTANT: Update These Values**

You need to update the following values in `toolgostar-backend/.env` with your actual server information:

### 1. **Server URLs** (Replace `your-server-ip-or-domain`)
```env
FRONTEND_URL=http://YOUR_SERVER_IP_OR_DOMAIN
ADMIN_URL=http://YOUR_SERVER_IP_OR_DOMAIN/toolgostar-admin
API_URL=http://YOUR_SERVER_IP_OR_DOMAIN:3001/api/v1
CORS_ORIGIN=http://YOUR_SERVER_IP_OR_DOMAIN,http://localhost:3000
```

### 2. **Email Configuration** (For contact forms)
```env
SMTP_USER=your-production-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

## 📋 **Examples for Different Server Setups**

### **Local Development Server:**
```env
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3000/toolgostar-admin
API_URL=http://localhost:3001/api/v1
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

### **Server with IP Address (e.g., 192.168.1.100):**
```env
FRONTEND_URL=http://192.168.1.100
ADMIN_URL=http://192.168.1.100/toolgostar-admin
API_URL=http://192.168.1.100:3001/api/v1
CORS_ORIGIN=http://192.168.1.100,http://localhost:3000
```

### **Server with Domain (e.g., myserver.com):**
```env
FRONTEND_URL=http://myserver.com
ADMIN_URL=http://myserver.com/toolgostar-admin
API_URL=http://myserver.com:3001/api/v1
CORS_ORIGIN=http://myserver.com,http://localhost:3000
```

## 🎯 **What This Fixes:**

✅ **CORS Configuration** - Backend now accepts requests from your frontend  
✅ **API URLs** - Frontend knows where to find the backend  
✅ **Database Setup** - SQLite database ready to use  
✅ **Security Settings** - Production-ready security configuration  
✅ **Email Integration** - Contact forms will work (after email setup)  

## 🚀 **Next Steps:**

1. **Update the URLs** in `.env` with your server information
2. **Set up email** (optional but recommended for contact forms)
3. **Initialize database** with test data
4. **Test the connection** between frontend and backend

## 📝 **Quick Test Commands:**

```bash
# Test if backend starts
cd toolgostar-backend
npm start

# Test database connection
npm run db:migrate

# Add test data
node add-test-products.js
```

Your backend is now configured for server deployment! 🎉

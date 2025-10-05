# ToolGostar Development Guide

This guide explains how to run ToolGostar in both **local development** and **production** modes.

## 🏠 **Local Development (No Backend Required)**

### **What You Get:**
- ✅ **Static website** with offline data
- ✅ **No 404 errors** - uses built-in sample data
- ✅ **Full functionality** for frontend development
- ✅ **No backend setup** required

### **How to Run:**
```bash
# Simply open the HTML files in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### **Features Available:**
- ✅ **Products page** - Shows sample products
- ✅ **Gallery page** - Shows sample projects  
- ✅ **News page** - Shows sample news articles
- ✅ **Contact forms** - Will show "API not available" message
- ✅ **Language switching** - English/Farsi
- ✅ **Responsive design** - All breakpoints work

## 🚀 **Production Mode (With Backend API)**

### **What You Get:**
- ✅ **Full API integration** with backend
- ✅ **Dynamic content** from database
- ✅ **Contact form submission** to backend
- ✅ **Admin panel** functionality
- ✅ **Real-time data** updates

### **How to Run:**
```bash
# 1. Start the backend
cd toolgostar-backend
npm install
cp env-toolgostar-production .env
# Edit .env with your email credentials
npm start

# 2. Start the frontend (in another terminal)
# The frontend will automatically detect the backend
```

## 🔧 **Configuration Modes**

### **Automatic Detection:**
The system automatically detects your environment:

- **localhost/127.0.0.1** → Development mode (offline data)
- **toolgostar.com** → Production mode (API enabled)

### **Manual Override:**
You can manually control the mode by editing the configuration in your HTML files:

```javascript
// In any HTML file, add this script before other scripts:
<script>
    window.TOOLGOSTAR_CONFIG = {
        apiEnabled: false,        // Set to false for offline mode
        forceOffline: true,      // Force offline data
        debug: true,            // Enable debug logging
        environment: 'development'
    };
</script>
```

## 📊 **Sample Data Available**

### **Products (Offline):**
- High-Efficiency Pressure Sand Filter
- Industrial Water Softener  
- Submersible Mixer

### **Projects (Offline):**
- Industrial Water Treatment Plant
- Municipal Wastewater Treatment

### **News (Offline):**
- New Water Treatment Technology
- Product Launch: Advanced Mixers

## 🎯 **Development Workflow**

### **Frontend Development:**
1. ✅ **Use offline mode** - No backend needed
2. ✅ **Edit HTML/CSS/JS** files
3. ✅ **Test responsive design**
4. ✅ **Test language switching**
5. ✅ **Test all pages**

### **Full Integration Testing:**
1. ✅ **Start backend** with `npm start`
2. ✅ **Frontend automatically** detects backend
3. ✅ **Test API integration**
4. ✅ **Test contact forms**
5. ✅ **Test admin panel**

## 🔍 **Troubleshooting**

### **404 Errors in Development:**
- ✅ **This is normal** - the system falls back to offline data
- ✅ **Check console** - you'll see "Using offline data" messages
- ✅ **No action needed** - the website works perfectly

### **API Connection Issues:**
- ✅ **Check backend** is running on port 3001
- ✅ **Check console** for connection status
- ✅ **System automatically** falls back to offline mode

### **Contact Forms Not Working:**
- ✅ **In offline mode** - forms show "API not available" message
- ✅ **In production mode** - forms submit to backend
- ✅ **This is expected behavior**

## 📋 **File Structure**

```
ToolGostar/
├── index.html              # Main page (auto-detects mode)
├── products.html           # Products page (auto-detects mode)
├── gallery.html            # Gallery page (auto-detects mode)
├── news.html               # News page (auto-detects mode)
├── contact.html            # Contact page (auto-detects mode)
├── about.html              # About page (auto-detects mode)
├── shared/
│   ├── js/
│   │   ├── config.js       # Main configuration
│   │   ├── api-integration.js # API with offline fallback
│   │   └── development-config.js # Development overrides
├── toolgostar-backend/     # Backend API (optional)
└── toolgostar-admin/       # Admin panel (optional)
```

## 🎉 **Summary**

- ✅ **Local development** - Works without backend
- ✅ **Production deployment** - Works with backend
- ✅ **Automatic detection** - No configuration needed
- ✅ **Graceful fallback** - Always works
- ✅ **No 404 errors** - Uses offline data when needed

**You can develop and test everything locally without any backend setup!** 🚀

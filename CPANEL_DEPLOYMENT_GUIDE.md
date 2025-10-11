# 🚀 ToolGostar cPanel Deployment Guide

Complete step-by-step guide for deploying ToolGostar to toolgostar.com on cPanel shared hosting.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Local Testing**
- [ ] All pages work on localhost
- [ ] Admin panel login works
- [ ] API endpoints respond correctly
- [ ] File uploads work (products, projects, news)
- [ ] Database has test data
- [ ] Images display correctly
- [ ] Both English and Farsi languages work

### **Configuration Files**
- [ ] `toolgostar-backend/env.production` exists
- [ ] All URLs in `shared/js/config.js` are correct
- [ ] `toolgostar-admin/config.js` has production URLs
- [ ] `.htaccess` files are in place

---

## 🔧 **STEP 1: PREPARE FILES FOR UPLOAD**

### **1.1 Backend Files**
```bash
cd toolgostar-backend

# Copy production environment file
cp env.production .env

# Edit .env and update:
# - JWT_SECRET (generate a secure random string)
# - SMTP credentials (if you have email service)
# - Any other sensitive values

# Create a .zip file for upload (EXCLUDE node_modules)
# Manually zip: src/, uploads/, database.sqlite, package.json, app.js, .env, .htaccess
```

**Files to include in backend .zip:**
- `app.js`
- `server.js`
- `.env` (with production values)
- `.htaccess`
- `package.json`
- `package-lock.json`
- `database.sqlite` (if you want to keep local data)
- `src/` directory (entire)
- `uploads/` directory (if you want to keep uploaded images)

**Files to EXCLUDE:**
- `node_modules/` (will be installed on server)
- `logs/` (will be created on server)
- `.git/` (not needed)
- Test files (`test-*.js`, `create-*.js`, etc.)

### **1.2 Frontend Files**
**Files to upload (from project root):**
- All `.html` files (index.html, home.html, products.html, gallery.html, news.html, contact.html, about.html, loading.html)
- `.htaccess`
- `css/` directory
- `js/` directory
- `shared/` directory
- `public/` directory
- `font/` directory
- `languages/` directory
- `src/` directory (if using Three.js shaders)

**Files to EXCLUDE:**
- `node_modules/` (if any)
- Test files
- `.git/`
- Backend files (they go in a separate directory)

### **1.3 Admin Panel Files**
**Files to upload (from toolgostar-admin):**
- `index.html`
- `login.html`
- `config.js`
- `.htaccess`
- `pages/` directory
- `assets/` directory
- `languages/` directory

**Files to EXCLUDE:**
- `test-*.html`
- `node_modules/`
- `.git/`

---

## 📁 **STEP 2: cPANEL FILE STRUCTURE**

### **Recommended Directory Structure on cPanel:**

```
/public_html/                       # All files in public_html
├── index.html                      # Frontend files
├── home.html
├── products.html
├── gallery.html
├── news.html
├── contact.html
├── about.html
├── loading.html
├── .htaccess
├── css/
├── js/
├── shared/
├── public/
├── font/
├── languages/
├── src/
│
├── toolgostar-backend/             # Backend Node.js app
│   ├── app.js
│   ├── server.js
│   ├── .env
│   ├── .htaccess
│   ├── package.json
│   ├── database.sqlite
│   ├── src/
│   ├── uploads/
│   ├── logs/
│   └── node_modules/ (will be installed)
│
└── toolgostar-admin/               # Admin panel
    ├── index.html
    ├── login.html
    ├── config.js
    ├── .htaccess
    ├── pages/
    ├── assets/
    └── languages/
```

---

## 🌐 **STEP 3: UPLOAD FILES TO cPANEL**

### **3.1 Using cPanel File Manager**

1. **Log in to cPanel** (https://yourhost.com:2083)

2. **Upload Frontend Files:**
   - Go to **File Manager**
   - Navigate to `public_html/`
   - Click **Upload**
   - Upload all frontend files
   - Extract if uploaded as .zip

3. **Upload Backend Files:**
   - Go to **File Manager**
   - Navigate to `public_html/`
   - Click **New Folder** → Name it `toolgostar-backend`
   - Enter `toolgostar-backend/`
   - Click **Upload**
   - Upload backend .zip file
   - Extract the .zip file
   - **IMPORTANT:** Delete the .zip file after extraction

4. **Upload Admin Panel Files:**
   - Go to **File Manager**
   - Navigate to `public_html/`
   - Click **New Folder** → Name it `toolgostar-admin`
   - Enter `toolgostar-admin/`
   - Upload all admin panel files

### **3.2 Set File Permissions**

In cPanel File Manager:
- `public_html/toolgostar-backend/database.sqlite`: Set to **644** (read/write for owner)
- `public_html/toolgostar-backend/uploads/` directory: Set to **755** (read/write/execute for owner)
- `public_html/toolgostar-backend/.env` file: Set to **600** (read/write for owner only)
- All `.htaccess` files: Set to **644**

---

## 🚀 **STEP 4: SETUP NODE.JS APPLICATION**

### **4.1 Create Node.js App in cPanel**

1. Go to **cPanel Dashboard**
2. Find **Setup Node.js App** (under Software section)
3. Click **Create Application**
4. Configure:
   - **Node.js version**: 16.x or 18.x (latest LTS)
   - **Application mode**: Production
   - **Application root**: `public_html/toolgostar-backend`
   - **Application URL**: `api` (this creates `https://toolgostar.com/api/`)
   - **Application startup file**: `app.js`
   - **Passenger log file**: Enable (optional)

5. Click **Create**

**Important**: The app will be accessible at `https://toolgostar.com/api/` (not port 3001)

### **4.2 Install Dependencies**

After creating the app:

1. In the **Setup Node.js App** page, find your app
2. Click **Run NPM Install** button
   - This will run `npm install` in your backend directory
   - Wait for completion (may take 2-5 minutes)

OR use SSH/Terminal:
```bash
cd ~/public_html/toolgostar-backend
npm install --production
```

### **4.3 Set Environment Variables (in cPanel)**

In the Node.js App configuration page:

1. Scroll to **Environment Variables** section
2. Add these variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (or the port assigned by cPanel)
   - `BASE_URL` = `https://toolgostar.com`

**Note:** If you added `.env` file, these are already set. cPanel will use .env file by default.

### **4.4 Start the Application**

1. Click **Start App** button
2. Wait for status to show "Running"
3. Note the application URL (usually: `https://toolgostar.com:PORT`)

---

## 🔀 **STEP 5: CONFIGURE APACHE PROXY (URL Routing)**

### **5.1 Update Root .htaccess for API Routing**

**IMPORTANT**: Since the Node.js app is now accessible at `https://toolgostar.com/api/`, you may NOT need proxy rules in `.htaccess`. The cPanel Node.js manager handles this automatically.

However, if you need to proxy uploads, add these rules AFTER the RewriteEngine On line:

```apache
# Proxy uploads requests to Node.js backend (if needed)
RewriteCond %{REQUEST_URI} ^/uploads/
RewriteRule ^uploads/(.*)$ https://toolgostar.com/api/uploads/$1 [P,L]

# Enable proxy
RewriteEngine On
```

**Note**: API calls will go directly to `https://toolgostar.com/api/v1/` (no proxy needed)

### **5.2 Verify Admin Panel Access**

If admin panel is in `public_html/toolgostar-admin/`:
- URL: `https://toolgostar.com/toolgostar-admin/`
- No additional configuration needed

If admin panel is served by backend:
- Already configured in `app.js` (line 102)
- URL: `https://toolgostar.com/toolgostar-admin/`

---

## 🔒 **STEP 6: SECURITY CONFIGURATION**

### **6.1 Secure .env File**

```bash
chmod 600 ~/public_html/toolgostar-backend/.env
```

### **6.2 Secure Database File**

```bash
chmod 644 ~/public_html/toolgostar-backend/database.sqlite
```

### **6.3 Enable HTTPS**

In cPanel:
1. Go to **SSL/TLS Status**
2. Enable **AutoSSL** for your domain
3. Wait for SSL certificate to be issued
4. Uncomment HTTPS redirect in `.htaccess` files

### **6.4 Update JWT Secret**

Edit `~/public_html/toolgostar-backend/.env`:
```env
JWT_SECRET=e9f9c0fcdd67b828a6e7d0bcc394a39fd5a2f6b6e53bb6de3e90037f94d5360a4e68a957c917a10f33dca23742f6537906a24b642257ae86c8c04bc4c82d25bd
```

**Note**: The JWT secret is already generated and included in the production environment file.

---

## 📊 **STEP 7: DATABASE INITIALIZATION**

### **7.1 If Starting Fresh (No Local Data)**

SSH into your server:
```bash
cd ~/public_html/toolgostar-backend
node create-admin.js
```

This creates:
- Admin user: `admin@toolgostar.com`
- Password: `ToolGostar2025!` (CHANGE THIS IMMEDIATELY)

### **7.2 If Using Existing Database**

- Upload your local `database.sqlite` file
- Ensure it's in `~/public_html/toolgostar-backend/`
- Set permissions: `chmod 644 database.sqlite`

### **7.3 Verify Database**

```bash
cd ~/public_html/toolgostar-backend
node check-database.js
```

---

## ✅ **STEP 8: POST-DEPLOYMENT TESTING**

### **8.1 Test Frontend**
- [ ] Visit `https://toolgostar.com`
- [ ] Navigate to all pages (Home, Products, Gallery, News, Contact, About)
- [ ] Test language switcher (English ↔ Farsi)
- [ ] Check that images load
- [ ] Verify product/project/news cards display

### **8.2 Test Backend API**
- [ ] Visit `https://toolgostar.com/api/v1/health` (should return healthy status)
- [ ] Visit `https://toolgostar.com/api/v1/products` (should return products)
- [ ] Visit `https://toolgostar.com/api/v1/projects` (should return projects)
- [ ] Visit `https://toolgostar.com/api/v1/news` (should return news)

**Note**: These URLs work directly (no port 3001) because cPanel Node.js manager handles the routing automatically.

### **8.3 Test Admin Panel**
- [ ] Visit `https://toolgostar.com/toolgostar-admin/`
- [ ] Log in with admin credentials
- [ ] Test creating a new product
- [ ] Test uploading an image
- [ ] Test editing existing content
- [ ] Verify changes appear on frontend

### **8.4 Test Contact Form**
- [ ] Go to Contact page
- [ ] Submit a test inquiry
- [ ] Check admin panel → Contacts section
- [ ] Verify contact appears

---

## 🐛 **STEP 9: TROUBLESHOOTING**

### **Problem: Node.js app won't start**
**Solutions:**
1. Check Node.js version (must be 16+ or 18+)
2. Verify `package.json` exists
3. Run `npm install` again
4. Check error logs in cPanel Node.js App section
5. Verify `.env` file exists and has correct values

### **Problem: 502 Bad Gateway on API calls**
**Solutions:**
1. Verify Node.js app is running (green status in cPanel)
2. **CRITICAL**: Don't use port 3001 in production! Use cPanel Node.js app manager
3. Check that Application URL is set to `api` (creates `/api/` path)
4. Verify CORS configuration in backend
5. Check `~/toolgostar-backend/logs/app.log` for errors

### **Problem: 553/Non-standard error on API calls**
**Cause**: Trying to access `https://toolgostar.com:3001/api/v1/health` (blocked port)
**Solution**: Use `https://toolgostar.com/api/v1/health` instead (no port)

### **Problem: Images not loading**
**Solutions:**
1. Verify `uploads/` directory exists and has 755 permissions
2. Check image paths in database (should be `/uploads/filename.ext`)
3. Verify `/uploads` proxy rule in root `.htaccess`
4. Check if files are actually uploaded to `~/toolgostar-backend/uploads/`

### **Problem: Admin panel login fails**
**Solutions:**
1. Verify admin user exists: `node check-database.js`
2. Create admin user: `node create-admin.js`
3. Check API URL in `toolgostar-admin/config.js`
4. Verify backend is running
5. Check browser console for CORS errors

### **Problem: Database errors**
**Solutions:**
1. Check database file exists: `ls -la ~/public_html/toolgostar-backend/database.sqlite`
2. Verify file permissions: `chmod 644 database.sqlite`
3. Initialize database: `node initialize-database.js`
4. Check logs: `tail -f ~/public_html/toolgostar-backend/logs/app.log`

### **Problem: CORS errors in browser console**
**Solutions:**
1. Verify `CORS_ORIGIN` in `.env` includes your domain
2. Check `toolgostar-backend/src/middleware/cors.js`
3. Ensure `.htaccess` CORS headers are correct
4. Clear browser cache and hard refresh

---

## 📝 **STEP 10: POST-DEPLOYMENT TASKS**

### **10.1 Change Default Credentials**
- [ ] Change admin password in Admin Panel → Settings → Users
- [ ] Update admin email to your actual email

### **10.2 Configure Email Service**
Update in `.env`:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM_ADDRESS=noreply@toolgostar.com
```

### **10.3 Add Content**
- [ ] Add real products (with images and catalogs)
- [ ] Add real projects (with images)
- [ ] Add real news articles
- [ ] Update company information
- [ ] Test all functionality

### **10.4 Setup Monitoring**
- [ ] Enable error logging in cPanel
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure backup schedule (cPanel → Backup Wizard)

### **10.5 Performance Optimization**
- [ ] Enable CloudFlare or CDN (optional)
- [ ] Enable cPanel built-in caching
- [ ] Optimize images (compress before upload)
- [ ] Test site speed (Google PageSpeed Insights)

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your ToolGostar website is now live at:
- **Frontend**: https://toolgostar.com
- **Admin Panel**: https://toolgostar.com/toolgostar-admin/
- **API**: https://toolgostar.com/api/v1/

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review logs: `~/toolgostar-backend/logs/app.log`
3. Check cPanel Node.js App error logs
4. Verify all configuration files have correct values

---

## 🔄 **UPDATING THE SITE**

To update code after deployment:

1. **Update Frontend:** Upload new files to `public_html/`
2. **Update Backend:** 
   - Upload new files to `~/toolgostar-backend/`
   - Restart Node.js app in cPanel
3. **Update Admin Panel:** Upload new files to admin directory

**Note:** Always backup database before major updates!

---

**Last Updated:** 2025-01-XX
**Version:** 1.0.0


# ToolGostar Final Deployment Guide

## ✅ **URL Structure - STANDARDIZED**

All configurations now use **consistent URLs** without port numbers in production.

### **Production URLs (toolgostar.com):**
```
Frontend:        https://toolgostar.com
Admin Panel:     https://toolgostar.com/toolgostar-admin
API:             https://toolgostar.com/api/v1
Health Check:    https://toolgostar.com/api/v1/health
```

### **Development URLs (localhost):**
```
Frontend:        http://localhost:8000
Admin Panel:     http://localhost:8000/toolgostar-admin
API:             http://localhost:3001/api/v1
Health Check:    http://localhost:3001/api/v1/health
```

---

## 🔧 **How It Works**

### **With Nginx Reverse Proxy (RECOMMENDED for Production):**
```
User Request → Nginx (port 443) → Node.js Backend (port 3001)

https://toolgostar.com/api/v1/products
         ↓
    Nginx proxies to
         ↓
http://localhost:3001/api/v1/products
```

### **Benefits:**
- ✅ **No exposed ports** - Only 80/443 visible
- ✅ **SSL termination** - Nginx handles HTTPS
- ✅ **Clean URLs** - No port numbers in URLs
- ✅ **Better security** - Backend not directly accessible
- ✅ **Load balancing** - Can add multiple backend servers
- ✅ **Static file serving** - Nginx serves files efficiently

---

## 📋 **Configuration Files Updated**

### **1. Frontend Configuration (`shared/js/config.js`):**
```javascript
// ✅ UPDATED
apiBaseUrl: 'https://toolgostar.com/api/v1'  // No :3001
```

### **2. Admin Panel Configuration (`toolgostar-admin/config.js`):**
```javascript
// ✅ UPDATED
PROD_URL: 'https://toolgostar.com/api/v1'  // No :3001
```

### **3. Backend Environment (`toolgostar-backend/env-toolgostar-production`):**
```bash
# ✅ UPDATED
API_URL=https://toolgostar.com/api/v1  # No :3001
FRONTEND_URL=https://toolgostar.com
ADMIN_URL=https://toolgostar.com/toolgostar-admin
CORS_ORIGIN=https://toolgostar.com,https://www.toolgostar.com
```

### **4. Nginx Configuration (`toolgostar-backend/nginx-toolgostar.conf`):**
```nginx
# ✅ NEW FILE CREATED
location /api/v1 {
    proxy_pass http://localhost:3001/api/v1;
    # Proxies API requests to backend
}
```

---

## 🚀 **Deployment Steps**

### **Step 1: Deploy Backend**

```bash
# 1. Copy files to server
cd /var/www/toolgostar.com/toolgostar-backend

# 2. Install dependencies
npm install --production

# 3. Copy production environment file
cp env-toolgostar-production .env

# 4. Update email credentials in .env
nano .env
# Update: SMTP_USER and SMTP_PASSWORD

# 5. Initialize database (first time only)
node initialize-database.js

# 6. Start backend with PM2
pm2 start server.js --name toolgostar-backend
pm2 save
pm2 startup
```

### **Step 2: Deploy Frontend**

```bash
# 1. Copy files to web root
cp -r /path/to/ToolGostar/* /var/www/toolgostar.com/

# Directory structure should be:
# /var/www/toolgostar.com/
# ├── index.html
# ├── products.html
# ├── gallery.html
# ├── news.html
# ├── contact.html
# ├── about.html
# ├── shared/
# ├── css/
# ├── js/
# ├── public/
# └── toolgostar-admin/
```

### **Step 3: Configure Nginx**

```bash
# 1. Copy Nginx configuration
sudo cp nginx-toolgostar.conf /etc/nginx/sites-available/toolgostar.com

# 2. Update SSL certificate paths in the config
sudo nano /etc/nginx/sites-available/toolgostar.com
# Update:
#   ssl_certificate /path/to/your/certificate.crt
#   ssl_certificate_key /path/to/your/private.key

# 3. Create symbolic link
sudo ln -s /etc/nginx/sites-available/toolgostar.com /etc/nginx/sites-enabled/

# 4. Test Nginx configuration
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx
```

### **Step 4: Configure Firewall**

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Backend port should NOT be exposed externally
# Only accessible from localhost
```

---

## 🔍 **Verification**

### **Test 1: Health Check**
```bash
curl https://toolgostar.com/api/v1/health
# Expected: {"status":"UP","message":"ToolGostar Backend is running!"}
```

### **Test 2: Frontend**
```bash
curl https://toolgostar.com
# Expected: HTML content of index.html
```

### **Test 3: Admin Panel**
```bash
curl https://toolgostar.com/toolgostar-admin
# Expected: HTML content of admin login page
```

### **Test 4: API Endpoints**
```bash
# Test products API
curl https://toolgostar.com/api/v1/products

# Test projects API
curl https://toolgostar.com/api/v1/projects

# Test news API
curl https://toolgostar.com/api/v1/news
```

---

## 📊 **URL Consistency Check**

### **All Files Now Use:**
- ✅ `https://toolgostar.com/api/v1` (NO port 3001)
- ✅ `https://toolgostar.com` (frontend)
- ✅ `https://toolgostar.com/toolgostar-admin` (admin)

### **Files Verified:**
- ✅ `shared/js/config.js` - Frontend config
- ✅ `toolgostar-admin/config.js` - Admin config
- ✅ `toolgostar-backend/env-toolgostar-production` - Backend env
- ✅ `toolgostar-backend/env.production` - Backup env
- ✅ `toolgostar-backend/nginx-toolgostar.conf` - Nginx config

---

## 🔐 **Security Checklist**

- ✅ **Port 3001** - NOT exposed to internet
- ✅ **Nginx proxy** - Only way to access API
- ✅ **SSL/TLS** - All traffic encrypted
- ✅ **Firewall** - Only 80/443 open
- ✅ **CORS** - Properly configured
- ✅ **Security headers** - Added by Nginx
- ✅ **Rate limiting** - Available in backend
- ✅ **JWT tokens** - Secure authentication

---

## 🎯 **Alternative: Direct Port Access**

**If you want to use port 3001 directly (NOT RECOMMENDED):**

1. **Update all URLs to include :3001**:
   - `https://toolgostar.com/api/v1`

2. **Open port 3001 in firewall**:
   ```bash
   sudo ufw allow 3001/tcp
   ```

3. **Configure SSL in Node.js backend** (not Nginx)

**Why NOT recommended:**
- ❌ Less secure (backend directly exposed)
- ❌ No load balancing
- ❌ No static file optimization
- ❌ Harder to manage SSL certificates
- ❌ Port number in URLs looks unprofessional

---

## ✅ **Final Status**

### **Current Configuration:**
- ✅ **All URLs standardized** - No port numbers in production
- ✅ **Nginx proxy ready** - Configuration file provided
- ✅ **Backend runs on port 3001** - Not exposed externally
- ✅ **Clean URLs** - Professional appearance
- ✅ **Secure setup** - Best practices followed

### **What You Need to Do:**
1. ✅ Deploy backend files
2. ✅ Deploy frontend files
3. ✅ Configure Nginx with provided config
4. ✅ Update SSL certificate paths
5. ✅ Update email credentials in .env
6. ✅ Start backend with PM2
7. ✅ Test all endpoints

---

## 🚀 **Ready for Production**

Your ToolGostar application is now configured with:
- ✅ **Consistent URLs** across all files
- ✅ **Nginx reverse proxy** for security
- ✅ **Clean architecture** following best practices
- ✅ **No port numbers** in production URLs
- ✅ **Secure configuration** ready for deployment

**Deploy and enjoy!** 🎉

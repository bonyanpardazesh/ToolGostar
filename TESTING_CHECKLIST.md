# ✅ ToolGostar Testing Checklist

Comprehensive testing checklist for both local development and production deployment.

---

## 🏠 **LOCAL TESTING (Before Deployment)**

### **Backend API Tests**

#### **1. Server Startup**
- [ ] Backend starts without errors: `cd toolgostar-backend && node app.js`
- [ ] Database connection successful
- [ ] No module errors
- [ ] Port 3001 is listening
- [ ] Log file created: `logs/app.log`

#### **2. Health & Status Endpoints**
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Expected: {"status":"healthy","database":"connected",...}
```
- [ ] `/api/v1/health` returns healthy status
- [ ] Database status shows "connected"
- [ ] Response time < 100ms

#### **3. Product APIs**
```bash
# Get all products
curl http://localhost:3001/api/v1/products

# Get single product
curl http://localhost:3001/api/v1/products/1

# Get product categories
curl http://localhost:3001/api/v1/product-categories
```
- [ ] GET `/api/v1/products` returns product array
- [ ] GET `/api/v1/products/:id` returns single product
- [ ] GET `/api/v1/product-categories` returns categories
- [ ] Products have correct fields: name, shortDescription, featuredImage, etc.
- [ ] Image URLs are relative paths (`/uploads/...`)

#### **4. Project APIs**
```bash
# Get all projects
curl http://localhost:3001/api/v1/projects

# Get single project
curl http://localhost:3001/api/v1/projects/1

# Get project categories
curl http://localhost:3001/api/v1/project-categories
```
- [ ] GET `/api/v1/projects` returns project array
- [ ] GET `/api/v1/projects/:id` returns single project
- [ ] GET `/api/v1/project-categories` returns categories
- [ ] Projects have correct fields: title, description, featuredImage, etc.

#### **5. News APIs**
```bash
# Get all news
curl http://localhost:3001/api/v1/news

# Get single news article
curl http://localhost:3001/api/v1/news/1

# Get news categories
curl http://localhost:3001/api/v1/news-categories
```
- [ ] GET `/api/v1/news` returns news array with pagination
- [ ] GET `/api/v1/news/:id` returns single article
- [ ] GET `/api/v1/news-categories` returns categories
- [ ] News have correct fields: title, excerpt, content, featuredImage, etc.

#### **6. Contact Form API**
```bash
# Submit contact form
curl -X POST http://localhost:3001/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "123456789",
    "subject": "Test",
    "message": "Test message"
  }'
```
- [ ] POST `/api/v1/contacts` accepts form data
- [ ] Returns success response
- [ ] Contact saved in database
- [ ] Email sent (if SMTP configured)

#### **7. Authentication APIs**
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@toolgostar.com",
    "password": "admin123"
  }'
```
- [ ] POST `/api/v1/auth/login` returns JWT token
- [ ] Token is valid
- [ ] User details included in response
- [ ] Failed login returns 401 error

#### **8. Upload APIs (Protected)**
```bash
# Upload file (requires authentication token)
curl -X POST http://localhost:3001/api/v1/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.jpg"
```
- [ ] POST `/api/v1/media` uploads file
- [ ] File saved in `uploads/` directory
- [ ] Returns file URL
- [ ] Unauthorized request returns 401

---

### **Frontend Tests**

#### **1. Page Loading**
Visit each page at `http://localhost:3000`:
- [ ] `/` (index.html) redirects to loading.html
- [ ] `/loading.html` shows animation, redirects to home.html
- [ ] `/home.html` loads successfully
- [ ] `/products.html` loads successfully
- [ ] `/gallery.html` loads successfully
- [ ] `/news.html` loads successfully
- [ ] `/contact.html` loads successfully
- [ ] `/about.html` loads successfully

#### **2. API Integration (Products Page)**
On `http://localhost:3000/products.html`:
- [ ] Product cards load from API
- [ ] Product images display correctly
- [ ] Product descriptions in correct language
- [ ] Category filters work
- [ ] Search functionality works
- [ ] "View Details" opens modal
- [ ] Modal shows product info, features, specifications
- [ ] Download catalog button works
- [ ] No "API not initialized" errors in console

#### **3. API Integration (Gallery Page)**
On `http://localhost:3000/gallery.html`:
- [ ] Project cards load from API
- [ ] Project images display correctly
- [ ] Project descriptions in correct language
- [ ] Category filters work
- [ ] Search functionality works
- [ ] Clicking project opens lightbox
- [ ] Lightbox shows project details
- [ ] No static/hardcoded data displayed

#### **4. API Integration (News Page)**
On `http://localhost:3000/news.html`:
- [ ] News cards load from API
- [ ] News images display correctly
- [ ] News titles and excerpts in correct language
- [ ] Category filters work
- [ ] Search functionality works
- [ ] "Read More" opens lightbox
- [ ] Lightbox shows full article
- [ ] Published date displays correctly

#### **5. Contact Form**
On `http://localhost:3000/contact.html`:
- [ ] Form fields render correctly
- [ ] Required fields validation works
- [ ] Email format validation works
- [ ] Submit button works
- [ ] Success message shows after submission
- [ ] Error message shows if submission fails
- [ ] Form data sent to backend API

#### **6. Language Switching**
On all pages:
- [ ] English language selected by default (or Farsi if in Iran)
- [ ] Language switcher visible in header
- [ ] Clicking "FA" switches to Farsi
- [ ] Clicking "EN" switches to English
- [ ] Navigation menu translates
- [ ] Page content translates
- [ ] Product/project/news content translates
- [ ] RTL layout applied for Farsi
- [ ] Vazir font loads for Farsi
- [ ] Language preference persists on page reload

#### **7. Responsive Design**
Test on different screen sizes:
- [ ] Desktop (1920x1080): Layout looks good
- [ ] Laptop (1366x768): Layout looks good
- [ ] Tablet (768x1024): Layout adapts
- [ ] Mobile (375x667): Layout adapts
- [ ] Mobile menu works
- [ ] Images scale properly
- [ ] Text is readable on all devices

#### **8. Browser Console**
Check for errors in all browsers:
- [ ] Chrome: No errors
- [ ] Firefox: No errors
- [ ] Safari: No errors
- [ ] Edge: No errors
- [ ] No 404 errors for resources
- [ ] No CORS errors
- [ ] No JavaScript errors

---

### **Admin Panel Tests**

#### **1. Login**
At `http://localhost:3002/toolgostar-admin/`:
- [ ] Login page loads
- [ ] Email field works
- [ ] Password field works
- [ ] "Remember me" checkbox works
- [ ] Login button works
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows error message
- [ ] Token stored in localStorage

#### **2. Dashboard**
After login:
- [ ] Dashboard loads
- [ ] Statistics display (products, projects, news, contacts)
- [ ] Quick actions visible
- [ ] Navigation sidebar works
- [ ] Language switcher works
- [ ] Logout button works

#### **3. Products Management**
At `http://localhost:3002/toolgostar-admin/pages/products.html`:
- [ ] Products list loads
- [ ] "Add Product" button works
- [ ] Product form opens
- [ ] Category dropdown populates from API
- [ ] Image upload works
- [ ] Catalog PDF upload works
- [ ] English and Farsi fields work
- [ ] Submit creates new product
- [ ] New product appears in list
- [ ] Edit button works
- [ ] Delete button works
- [ ] Search/filter works

#### **4. Projects Management**
At `http://localhost:3002/toolgostar-admin/pages/projects.html`:
- [ ] Projects list loads
- [ ] "Add Project" button works
- [ ] Project form opens
- [ ] Category dropdown populates from API
- [ ] Image upload works
- [ ] English and Farsi fields work
- [ ] Submit creates new project
- [ ] New project appears in list
- [ ] Edit button works
- [ ] Delete button works

#### **5. News Management**
At `http://localhost:3002/toolgostar-admin/pages/news.html`:
- [ ] News list loads
- [ ] "Add News" button works
- [ ] News form opens
- [ ] Category dropdown populates from API
- [ ] Image upload works
- [ ] WYSIWYG editor works (if applicable)
- [ ] Tags input works
- [ ] Publish date picker works
- [ ] Submit creates new article
- [ ] New article appears in list
- [ ] Edit button works
- [ ] Delete button works

#### **6. Contacts Management**
At `http://localhost:3002/toolgostar-admin/pages/contacts.html`:
- [ ] Contacts list loads
- [ ] Contact details display correctly
- [ ] Status can be changed (New → Read → Replied)
- [ ] Delete button works
- [ ] Search/filter works

#### **7. Categories Management**
For Products, Projects, and News:
- [ ] Categories load from database
- [ ] Not hardcoded in JavaScript
- [ ] Add category works
- [ ] Edit category works
- [ ] Delete category works
- [ ] Category changes reflect in frontend

---

## 🌐 **PRODUCTION TESTING (After Deployment)**

### **Pre-Deployment Final Checks**
Before deploying to production:
- [ ] All local tests passing
- [ ] Database has real data (not test data)
- [ ] Images are optimized
- [ ] `.env` file has production values
- [ ] JWT_SECRET changed from default
- [ ] SMTP credentials configured
- [ ] Admin password changed from default

---

### **Post-Deployment Tests**

#### **1. Domain & SSL**
- [ ] `https://toolgostar.com` loads without errors
- [ ] SSL certificate is valid (green padlock)
- [ ] No mixed content warnings
- [ ] HTTP redirects to HTTPS

#### **2. Backend API (Production)**
```bash
# Health check
curl https://toolgostar.com/api/v1/health

# Products
curl https://toolgostar.com/api/v1/products

# Projects
curl https://toolgostar.com/api/v1/projects

# News
curl https://toolgostar.com/api/v1/news
```
- [ ] All API endpoints respond
- [ ] Response time < 500ms
- [ ] No 502/503 errors
- [ ] CORS headers present

#### **3. Frontend Pages (Production)**
Visit each page at `https://toolgostar.com`:
- [ ] Home page loads
- [ ] Products page loads with data from API
- [ ] Gallery page loads with data from API
- [ ] News page loads with data from API
- [ ] Contact page loads and form works
- [ ] About page loads
- [ ] No console errors
- [ ] Images load correctly

#### **4. Image Loading**
- [ ] Product images load from `https://toolgostar.com/uploads/`
- [ ] Project images load correctly
- [ ] News images load correctly
- [ ] No broken image icons
- [ ] Images display in correct size
- [ ] Image URLs are correct (not localhost)

#### **5. Admin Panel (Production)**
Visit `https://toolgostar.com/toolgostar-admin/`:
- [ ] Login page loads
- [ ] Login works with production credentials
- [ ] Dashboard loads
- [ ] All management pages work
- [ ] File uploads work
- [ ] Changes reflect on frontend immediately
- [ ] Logout works

#### **6. Contact Form (Production)**
- [ ] Submit test inquiry
- [ ] Success message displayed
- [ ] Contact appears in admin panel
- [ ] Email received (if SMTP configured)

#### **7. Security**
- [ ] `.env` file not accessible via URL
- [ ] `database.sqlite` file not accessible via URL
- [ ] `node_modules/` not accessible via URL
- [ ] Admin panel requires login
- [ ] API endpoints have proper authentication
- [ ] HTTPS enforced on all pages

#### **8. Performance**
Test with Google PageSpeed Insights (https://pagespeed.web.dev/):
- [ ] Mobile score > 70
- [ ] Desktop score > 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Time to Interactive < 4s

#### **9. Cross-Browser (Production)**
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Safari: All features work
- [ ] Mobile Chrome: All features work

#### **10. SEO & Meta Tags**
Check each page:
- [ ] Page titles are set
- [ ] Meta descriptions present
- [ ] Open Graph tags present
- [ ] Favicon loads
- [ ] Canonical URLs set

---

## 🐛 **Common Issues & Solutions**

### **Issue: "API not initialized" error**
**Cause:** `config.js` loaded after `api-integration.js`  
**Solution:** Verify script order in HTML:
```html
<script src="shared/js/config.js"></script>
<script src="shared/js/server-config.js"></script>
<script src="shared/js/api-integration.js"></script>
```

### **Issue: Images not loading (showing placeholder)**
**Cause:** Image URLs point to localhost  
**Solution:** 
- Check `CommonApp.getImageUrl()` function
- Verify backend stores relative paths (`/uploads/`)
- Clear browser cache

### **Issue: 502 Bad Gateway on API calls**
**Cause:** Node.js app not running  
**Solution:**
- Check cPanel Node.js App status
- Restart the application
- Check error logs

### **Issue: CORS errors in console**
**Cause:** Backend CORS not configured for production domain  
**Solution:**
- Update `CORS_ORIGIN` in `.env`
- Add `toolgostar.com` to `cors.js` middleware
- Restart backend

### **Issue: Admin login fails**
**Cause:** No admin user or wrong credentials  
**Solution:**
```bash
cd toolgostar-backend
node create-admin.js
# Login: admin@toolgostar.com / admin123
```

### **Issue: Categories not loading in admin panel**
**Cause:** API endpoints not returning data or not authenticated  
**Solution:**
- Verify token in localStorage
- Check category API endpoints
- Add categories via database or API

---

## 📊 **Testing Summary Template**

Use this template to track testing progress:

```
=== TESTING SESSION ===
Date: [DATE]
Tester: [NAME]
Environment: [Local / Production]

BACKEND TESTS:
- Server Startup: [ ]
- Health Endpoint: [ ]
- Product APIs: [ ]
- Project APIs: [ ]
- News APIs: [ ]
- Contact API: [ ]
- Auth APIs: [ ]
- Upload APIs: [ ]

FRONTEND TESTS:
- Page Loading: [ ]
- Products Page: [ ]
- Gallery Page: [ ]
- News Page: [ ]
- Contact Form: [ ]
- Language Switching: [ ]
- Responsive Design: [ ]
- Browser Console: [ ]

ADMIN PANEL TESTS:
- Login: [ ]
- Dashboard: [ ]
- Products Management: [ ]
- Projects Management: [ ]
- News Management: [ ]
- Contacts Management: [ ]
- Categories Management: [ ]

PRODUCTION TESTS (if applicable):
- Domain & SSL: [ ]
- Backend API: [ ]
- Frontend Pages: [ ]
- Image Loading: [ ]
- Admin Panel: [ ]
- Contact Form: [ ]
- Security: [ ]
- Performance: [ ]
- Cross-Browser: [ ]
- SEO & Meta Tags: [ ]

ISSUES FOUND:
1. [Issue description]
2. [Issue description]

NOTES:
[Any additional notes or observations]

=== END OF SESSION ===
```

---

## ✅ **Sign-Off Checklist**

Before considering the project complete:
- [ ] All local tests passed
- [ ] All production tests passed
- [ ] No critical console errors
- [ ] Performance is acceptable
- [ ] Security is hardened
- [ ] Admin credentials changed
- [ ] Backup created
- [ ] Documentation complete
- [ ] Client/stakeholder approved

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX


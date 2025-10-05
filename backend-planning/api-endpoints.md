# ToolGostar Backend API Endpoints

Base URL: `https://api.toolgostar.com/v1`

## Authentication
All admin endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Success message",
  "pagination": {...} // Only for list endpoints
}
```

## Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {...}
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login admin user
```json
{
  "email": "admin@toolgostar.com",
  "password": "password"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "admin@toolgostar.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin"
    }
  }
}
```

### POST /auth/logout
Logout current user (blacklist token)

### GET /auth/profile
Get current user profile (requires auth)

### PUT /auth/profile
Update current user profile (requires auth)

---

## 📦 Product Endpoints

### GET /products
Get all products with filtering and pagination
**Query Parameters:**
- `category` - Filter by category slug
- `featured` - Filter featured products (true/false)
- `active` - Filter active products (true/false)
- `search` - Search in name/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (name, created_at, sort_order)
- `order` - Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Water Treatment System TG-WT-1000",
      "slug": "water-treatment-system-tg-wt-1000",
      "category": {
        "id": 1,
        "name": "Water & Wastewater Equipment",
        "slug": "water-wastewater"
      },
      "short_description": "Advanced water treatment system...",
      "specifications": {
        "power_range": "15-150 kW",
        "capacity": "Up to 5000 m³/day",
        "material": "Stainless Steel 316L"
      },
      "features": ["Multi-stage filtration", "UV disinfection"],
      "applications": ["Industrial wastewater", "Municipal water"],
      "featured_image": "https://cdn.toolgostar.com/products/wt-1000.jpg",
      "catalog_en_url": "https://cdn.toolgostar.com/catalogs/wt-1000-en.pdf",
      "is_active": true,
      "featured": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 45,
    "items_per_page": 10
  }
}
```

### GET /products/:id
Get single product by ID or slug

### POST /products (Admin)
Create new product
```json
{
  "name": "New Product",
  "category_id": 1,
  "short_description": "Short description",
  "full_description": "Full description",
  "specifications": {
    "power_range": "5-75 kW",
    "capacity": "1000 m³/day"
  },
  "features": ["Feature 1", "Feature 2"],
  "applications": ["Application 1", "Application 2"],
  "featured_image": "image_url",
  "catalog_en_url": "catalog_url",
  "is_active": true,
  "featured": false
}
```

### PUT /products/:id (Admin)
Update product

### DELETE /products/:id (Admin)
Delete product (soft delete)

### GET /products/categories
Get all product categories
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Water & Wastewater Equipment",
      "slug": "water-wastewater",
      "description": "Complete water treatment systems...",
      "product_count": 15
    }
  ]
}
```

---

## 🏗️ Project Endpoints (Gallery)

### GET /projects
Get all projects with filtering
**Query Parameters:**
- `category` - Filter by category slug
- `featured` - Filter featured projects
- `status` - Filter by status (completed, ongoing, planned)
- `location` - Filter by location
- `page`, `limit`, `sort`, `order` - Pagination/sorting

### GET /projects/:id
Get single project by ID or slug

### POST /projects (Admin)
Create new project
```json
{
  "title": "Water Treatment Plant - Tehran",
  "description": "Complete water treatment facility...",
  "location": "Tehran, Iran",
  "client_name": "Industrial Complex Ltd",
  "category_id": 1,
  "capacity": "1000 m³/day",
  "project_type": "New Installation",
  "completion_date": "2024-12-01",
  "duration_months": 8,
  "featured_image": "image_url",
  "gallery_images": ["img1.jpg", "img2.jpg"],
  "equipment_used": ["Mixers", "Pumps", "Filters"],
  "challenges_solved": "Complex technical challenges...",
  "results_achieved": "Excellent performance results...",
  "status": "completed",
  "is_featured": true
}
```

### PUT /projects/:id (Admin)
Update project

### DELETE /projects/:id (Admin)
Delete project

### GET /projects/categories
Get project categories

---

## 📰 News Endpoints

### GET /news
Get all news articles with filtering
**Query Parameters:**
- `category` - Filter by category slug
- `status` - Filter by status (published, draft)
- `featured` - Filter featured articles
- `author` - Filter by author ID
- `search` - Search in title/content
- `tags` - Filter by tags
- `page`, `limit`, `sort`, `order` - Pagination/sorting

### GET /news/:id
Get single news article by ID or slug

### POST /news (Admin)
Create new news article
```json
{
  "title": "New Product Launch",
  "slug": "new-product-launch-2025",
  "excerpt": "We are excited to announce...",
  "content": "Full article content in HTML...",
  "category_id": 1,
  "featured_image": "image_url",
  "meta_title": "SEO title",
  "meta_description": "SEO description",
  "tags": ["product", "launch", "innovation"],
  "status": "published",
  "published_at": "2025-01-15T10:00:00Z",
  "is_featured": true
}
```

### PUT /news/:id (Admin)
Update news article

### DELETE /news/:id (Admin)
Delete news article

### GET /news/categories
Get news categories

---

## 📞 Contact Endpoints

### POST /contact/submit
Submit contact form
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "company": "Industrial Corp",
  "industry": "manufacturing",
  "project_type": "new-installation",
  "subject": "Water treatment system inquiry",
  "message": "We need a water treatment system...",
  "source": "contact_page"
}
```

### POST /contact/quote
Submit quote request
```json
{
  "contact_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "company": "Industrial Corp"
  },
  "project_details": {
    "products": ["product_uuid_1", "product_uuid_2"],
    "product_categories": [1, 2],
    "required_capacity": "2000 m³/day",
    "budget_range": "$100k-500k",
    "timeline": "6 months",
    "technical_requirements": "Specific technical needs..."
  }
}
```

### GET /contact (Admin)
Get all contact submissions with filtering
**Query Parameters:**
- `status` - Filter by status (new, in_progress, replied, closed)
- `priority` - Filter by priority
- `assigned_to` - Filter by assigned user
- `date_from`, `date_to` - Date range filter
- `page`, `limit`, `sort`, `order`

### GET /contact/:id (Admin)
Get single contact submission

### PUT /contact/:id/status (Admin)
Update contact status
```json
{
  "status": "in_progress",
  "priority": "high",
  "assigned_to": "user_uuid",
  "internal_notes": "Following up with client..."
}
```

---

## 📁 Media Endpoints

### POST /media/upload
Upload file(s)
**Content-Type:** `multipart/form-data`
```
files: [File objects]
alt_text: "Optional alt text for images"
used_in: "product" // Optional: product, project, news
used_in_id: "uuid" // Optional: related entity ID
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "image_123.jpg",
      "original_name": "product_photo.jpg",
      "file_url": "https://cdn.toolgostar.com/uploads/image_123.jpg",
      "file_size": 245760,
      "mime_type": "image/jpeg",
      "width": 1200,
      "height": 800
    }
  ]
}
```

### GET /media
Get media library with filtering (Admin)
**Query Parameters:**
- `type` - Filter by file type (image, document, video)
- `used_in` - Filter by usage context
- `page`, `limit`, `sort`, `order`

### DELETE /media/:id (Admin)
Delete media file

---

## ⚙️ Settings Endpoints

### GET /settings
Get public site settings
```json
{
  "success": true,
  "data": {
    "site_title": "ToolGostar Industrial Group",
    "site_description": "Leading manufacturer...",
    "contact_email": "toolgostar@yahoo.com",
    "contact_phone": "021-22357761-3",
    "company_founded": 2009,
    "projects_completed": 500,
    "countries_served": 15,
    "years_experience": 15
  }
}
```

### GET /settings/all (Admin)
Get all settings including private ones

### PUT /settings (Admin)
Update settings
```json
{
  "site_title": "New Site Title",
  "contact_email": "new@email.com"
}
```

### GET /settings/company
Get company information (offices, addresses)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "office_type": "head_office",
      "name": "ToolGostar Industrial Group - Head Office",
      "address": "No. 10, Soheil Complex...",
      "city": "Tehran",
      "country": "Iran",
      "phone": "021-22357761-3",
      "email": "toolgostar@yahoo.com",
      "working_hours": "Saturday-Wednesday: 8:00 AM - 5:00 PM",
      "is_primary": true
    }
  ]
}
```

---

## 📊 Analytics Endpoints

### POST /analytics/pageview
Track page view
```json
{
  "page_url": "/products/water-treatment",
  "page_title": "Water Treatment Systems",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0...",
  "session_id": "session_uuid"
}
```

### GET /analytics/dashboard (Admin)
Get analytics dashboard data
```json
{
  "success": true,
  "data": {
    "page_views": {
      "total": 15420,
      "today": 245,
      "this_week": 1834,
      "this_month": 7235
    },
    "top_pages": [
      {"url": "/products", "views": 3421},
      {"url": "/", "views": 2156}
    ],
    "contact_forms": {
      "total": 156,
      "this_month": 23,
      "conversion_rate": 2.3
    },
    "popular_products": [
      {"name": "Water Treatment System", "views": 892}
    ]
  }
}
```

---

## 🔍 Search Endpoints

### GET /search
Global search across products, projects, news
**Query Parameters:**
- `q` - Search query
- `type` - Filter by content type (products, projects, news, all)
- `category` - Filter by category
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "projects": [...],
    "news": [...],
    "total_results": 45
  }
}
```

---

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Admin endpoints: 1000 requests per minute per user
- File upload: 10 requests per minute per user
- Contact form: 5 requests per hour per IP

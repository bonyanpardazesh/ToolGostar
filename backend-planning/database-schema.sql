-- ToolGostar Industrial Group - Database Schema
-- PostgreSQL Database Structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- CORE TABLES
-- ================================

-- Users table for admin access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories (Water Treatment, Mixers, Pumps)
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES product_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    short_description TEXT,
    full_description TEXT,
    features TEXT[], -- Array of features
    applications TEXT[], -- Array of applications
    
    -- Technical Specifications
    specifications JSONB, -- Flexible JSON for different spec types
    power_range VARCHAR(100),
    capacity VARCHAR(100),
    flow_rate VARCHAR(100),
    efficiency VARCHAR(100),
    material VARCHAR(100),
    head_range VARCHAR(100),
    
    -- Catalog files
    catalog_en_url VARCHAR(500),
    catalog_fa_url VARCHAR(500),
    
    -- Images
    featured_image VARCHAR(500),
    gallery_images TEXT[], -- Array of image URLs
    
    -- Meta data
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- PROJECTS & GALLERY
-- ================================

-- Project categories for gallery filtering
CREATE TABLE project_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (for gallery showcase)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(255),
    client_name VARCHAR(255),
    category_id INTEGER REFERENCES project_categories(id),
    
    -- Project details
    capacity VARCHAR(100),
    project_type VARCHAR(100),
    completion_date DATE,
    duration_months INTEGER,
    
    -- Images
    featured_image VARCHAR(500),
    gallery_images TEXT[], -- Array of image URLs
    before_images TEXT[], -- Before project images
    after_images TEXT[], -- After project images
    
    -- Technical details
    equipment_used TEXT[],
    challenges_solved TEXT,
    results_achieved TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- completed, ongoing, planned
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- NEWS & CONTENT
-- ================================

-- News categories
CREATE TABLE news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for category
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category_id INTEGER REFERENCES news_categories(id),
    
    -- Images
    featured_image VARCHAR(500),
    gallery_images TEXT[],
    
    -- Meta data
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[],
    
    -- Publishing
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    published_at TIMESTAMP,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    
    -- Author
    author_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- CONTACT & COMMUNICATIONS
-- ================================

-- Contact form submissions
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Project details
    industry VARCHAR(100),
    project_type VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Internal handling
    status VARCHAR(50) DEFAULT 'new', -- new, in_progress, replied, closed
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to UUID REFERENCES users(id),
    internal_notes TEXT,
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    source VARCHAR(100), -- contact_form, product_page, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quote requests (for detailed product inquiries)
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id),
    
    -- Products of interest
    products UUID[], -- Array of product IDs
    product_categories INTEGER[], -- Array of category IDs
    
    -- Project requirements
    required_capacity VARCHAR(100),
    budget_range VARCHAR(100),
    timeline VARCHAR(100),
    technical_requirements TEXT,
    
    -- Quote details
    quote_number VARCHAR(50) UNIQUE,
    quote_amount DECIMAL(12,2),
    quote_currency VARCHAR(3) DEFAULT 'USD',
    quote_validity_days INTEGER DEFAULT 30,
    quote_pdf_url VARCHAR(500),
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, quoted, accepted, rejected
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- MEDIA & FILES
-- ================================

-- Media library for file management
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    file_type VARCHAR(50), -- image, document, video, etc.
    
    -- Image specific
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    
    -- Usage tracking
    used_in VARCHAR(50), -- product, project, news, etc.
    used_in_id UUID,
    
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- SITE SETTINGS & CONFIGURATION
-- ================================

-- Site settings
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can be accessed via public API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company information
CREATE TABLE company_info (
    id SERIAL PRIMARY KEY,
    office_type VARCHAR(50), -- head_office, factory, service_center
    name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(255),
    working_hours TEXT,
    coordinates POINT, -- For map integration
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ANALYTICS & TRACKING
-- ================================

-- Page views tracking
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50), -- mobile, desktop, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    session_id VARCHAR(255),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form analytics
CREATE TABLE contact_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type VARCHAR(50), -- contact, quote, newsletter
    page_url VARCHAR(500),
    conversion_source VARCHAR(100),
    time_on_page INTEGER, -- seconds
    form_completion_time INTEGER, -- seconds
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Product indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);

-- Project indexes
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(is_featured);
CREATE INDEX idx_projects_public ON projects(is_public);

-- News indexes
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published ON news(published_at);
CREATE INDEX idx_news_featured ON news(is_featured);

-- Contact indexes
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created ON contacts(created_at);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Media indexes
CREATE INDEX idx_media_type ON media(file_type);
CREATE INDEX idx_media_usage ON media(used_in, used_in_id);

-- Analytics indexes
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_date ON page_views(viewed_at);
CREATE INDEX idx_page_views_ip ON page_views(ip_address);

-- ================================
-- INITIAL DATA
-- ================================

-- Insert default product categories
INSERT INTO product_categories (name, slug, description) VALUES
('Water & Wastewater Equipment', 'water-wastewater', 'Complete water treatment systems including filtration, disinfection, and purification equipment'),
('Mixers & Aerators', 'mixers-aerators', 'High-efficiency mixing and aeration equipment for optimal water treatment processes'),
('Pumps & Submersible Systems', 'pumps-submersible', 'Robust pumping solutions and submersible mixing systems');

-- Insert default project categories
INSERT INTO project_categories (name, slug, description) VALUES
('Water Treatment Plants', 'water-treatment', 'Complete water treatment facility installations'),
('Mixing Systems', 'mixing-systems', 'Industrial mixing and aeration system installations'),
('Pumping Stations', 'pumping-stations', 'Pump station and submersible system projects');

-- Insert default news categories
INSERT INTO news_categories (name, slug, description, color) VALUES
('Product News', 'product-news', 'New product launches and updates', '#2563eb'),
('Company News', 'company-news', 'Company announcements and milestones', '#059669'),
('Industry Insights', 'industry-insights', 'Technical articles and industry trends', '#7c3aed');

-- Insert default admin user (password should be hashed)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@toolgostar.com', '$2b$10$example_hash_here', 'Admin', 'User', 'admin');

-- Insert company information
INSERT INTO company_info (office_type, name, address, city, country, phone, fax, email, working_hours, is_primary) VALUES
('head_office', 'ToolGostar Industrial Group - Head Office', 'No. 10, Soheil Complex, Alameh Tabatabaie St, Saadat Abad', 'Tehran', 'Iran', '021-22357761-3', '021-22357762', 'toolgostar@yahoo.com', 'Saturday-Wednesday: 8:00 AM - 5:00 PM, Thursday: 8:00 AM - 1:00 PM', true),
('factory', 'ToolGostar Manufacturing Plant', 'Sanat 3 St, Takestan', 'Ghazvin', 'Iran', '028-32234567', '', 'factory@toolgostar.com', 'Saturday-Wednesday: 8:00 AM - 5:00 PM', false);

-- Insert essential site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_title', 'ToolGostar Industrial Group', 'string', 'general', 'Main site title', true),
('site_description', 'Leading manufacturer of industrial water treatment solutions', 'string', 'general', 'Site meta description', true),
('contact_email', 'toolgostar@yahoo.com', 'string', 'contact', 'Main contact email', true),
('contact_phone', '021-22357761-3', 'string', 'contact', 'Main contact phone', true),
('company_founded', '2009', 'number', 'company', 'Company founding year', true),
('projects_completed', '500', 'number', 'stats', 'Number of completed projects', true),
('countries_served', '15', 'number', 'stats', 'Number of countries served', true),
('years_experience', '15', 'number', 'stats', 'Years of experience', true);

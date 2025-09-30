/**
 * Test Product Upload Script
 * Tests the complete product creation flow via API
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';
const ADMIN_EMAIL = 'admin@toolgostar.com';
const ADMIN_PASSWORD = 'admin123';

class ProductUploadTester {
    constructor() {
        this.token = null;
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000
        });
    }

    async login() {
        try {
            console.log('🔐 Logging in...');
            const response = await this.api.post('/auth/login', {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            if (response.data.success) {
                this.token = response.data.data.token;
                this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                console.log('✅ Login successful');
                return true;
            } else {
                console.error('❌ Login failed:', response.data.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Login error:', error.response?.data || error.message);
            return false;
        }
    }

    async getCategories() {
        try {
            console.log('📂 Fetching categories...');
            const response = await this.api.get('/product-categories');
            
            if (response.data.success && response.data.data.length > 0) {
                console.log('✅ Categories found:', response.data.data.length);
                return response.data.data[0].id; // Use first category
            } else {
                console.log('⚠️ No categories found, will create one');
                return await this.createTestCategory();
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error.response?.data || error.message);
            return await this.createTestCategory();
        }
    }

    async createTestCategory() {
        try {
            console.log('📂 Creating test category...');
            const response = await this.api.post('/product-categories', {
                name: 'Test Category',
                description: 'Test category for product upload testing',
                isActive: true
            });

            if (response.data.success) {
                console.log('✅ Test category created:', response.data.data.id);
                return response.data.data.id;
            } else {
                console.error('❌ Failed to create category:', response.data.message);
                return 1; // Fallback
            }
        } catch (error) {
            console.error('❌ Error creating category:', error.response?.data || error.message);
            return 1; // Fallback
        }
    }

    async createTestProduct(categoryId) {
        try {
            console.log('📦 Creating test product...');
            
            // Create FormData for multipart upload
            const formData = new FormData();
            
            // Multilingual product data
            const productData = {
                name: JSON.stringify({
                    en: "FILTRATION SYSTEMS",
                    fa: "فیلتر شنی تحت فشار"
                }),
                shortDescription: JSON.stringify({
                    en: "High-efficiency pressure sand filter for water treatment applications. Features carbon steel construction and optimized filtration performance.",
                    fa: "فیلتر شنی تحت فشار با بازدهی بالا برای کاربردهای تصفیه آب. دارای ساختار فولاد کربن و عملکرد فیلتراسیون بهینه."
                }),
                features: JSON.stringify({
                    en: [
                        "High filtration efficiency",
                        "Carbon steel construction",
                        "Easy maintenance",
                        "Long service life"
                    ],
                    fa: [
                        "بازدهی فیلتراسیون بالا",
                        "ساختار فولاد کربن",
                        "نگهداری آسان",
                        "عمر طولانی"
                    ]
                }),
                applications: JSON.stringify({
                    en: [
                        "Water treatment plants",
                        "Industrial filtration",
                        "Municipal water systems",
                        "Wastewater treatment"
                    ],
                    fa: [
                        "تصفیه خانه های آب",
                        "فیلتراسیون صنعتی",
                        "سیستم های آب شهری",
                        "تصفیه فاضلاب"
                    ]
                }),
                specifications: JSON.stringify({
                    capacity: "1000-5000 L/day",
                    power: "1-5 HP",
                    material: "Carbon Steel",
                    pressure: "10-50 PSI",
                    temperature: "5-40°C"
                }),
                categoryId: categoryId,
                icon: "fas fa-filter",
                status: "active",
                isActive: "true",
                sortOrder: "0"
            };

            // Append all form data
            Object.entries(productData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Create a test image file (if needed)
            const testImagePath = path.join(__dirname, 'test-image.jpg');
            if (fs.existsSync(testImagePath)) {
                formData.append('featuredImage', fs.createReadStream(testImagePath));
                console.log('📷 Added test image');
            } else {
                console.log('⚠️ No test image found, proceeding without image');
            }

            // Create a test PDF catalog (if needed)
            const testCatalogPath = path.join(__dirname, 'test-catalog.pdf');
            if (fs.existsSync(testCatalogPath)) {
                formData.append('catalog', fs.createReadStream(testCatalogPath));
                console.log('📄 Added test catalog');
            } else {
                console.log('⚠️ No test catalog found, proceeding without catalog');
            }

            console.log('📤 Sending product data...');
            console.log('Form data fields:', Object.keys(productData));

            const response = await this.api.post('/products', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.data.success) {
                console.log('✅ Product created successfully!');
                console.log('Product ID:', response.data.data.id);
                console.log('Product Slug:', response.data.data.slug);
                console.log('Product Name (EN):', response.data.data.name?.en);
                console.log('Product Name (FA):', response.data.data.name?.fa);
                return response.data.data;
            } else {
                console.error('❌ Product creation failed:', response.data.message);
                return null;
            }

        } catch (error) {
            console.error('❌ Product creation error:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error:', error.message);
            }
            return null;
        }
    }

    async getProduct(productId) {
        try {
            console.log(`📖 Fetching product ${productId}...`);
            const response = await this.api.get(`/products/${productId}`);
            
            if (response.data.success) {
                console.log('✅ Product retrieved successfully!');
                console.log('Product Data:', JSON.stringify(response.data.data, null, 2));
                return response.data.data;
            } else {
                console.error('❌ Failed to retrieve product:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('❌ Error retrieving product:', error.response?.data || error.message);
            return null;
        }
    }

    async updateProduct(productId) {
        try {
            console.log(`✏️ Updating product ${productId}...`);
            
            const updateData = {
                name: JSON.stringify({
                    en: "UPDATED FILTRATION SYSTEMS",
                    fa: "فیلتر شنی تحت فشار به‌روزرسانی شده"
                }),
                shortDescription: JSON.stringify({
                    en: "Updated high-efficiency pressure sand filter with enhanced performance.",
                    fa: "فیلتر شنی تحت فشار به‌روزرسانی شده با عملکرد بهبود یافته."
                }),
                specifications: JSON.stringify({
                    capacity: "2000-10000 L/day",
                    power: "2-10 HP",
                    material: "Stainless Steel",
                    pressure: "15-75 PSI",
                    temperature: "0-50°C"
                })
            };

            const formData = new FormData();
            Object.entries(updateData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await this.api.put(`/products/${productId}`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.data.success) {
                console.log('✅ Product updated successfully!');
                console.log('Updated Name (EN):', response.data.data.name?.en);
                console.log('Updated Name (FA):', response.data.data.name?.fa);
                return response.data.data;
            } else {
                console.error('❌ Product update failed:', response.data.message);
                return null;
            }

        } catch (error) {
            console.error('❌ Product update error:');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error:', error.message);
            }
            return null;
        }
    }

    async runTest() {
        console.log('🚀 Starting Product Upload Test...\n');

        // Step 1: Login
        const loginSuccess = await this.login();
        if (!loginSuccess) {
            console.error('❌ Cannot proceed without authentication');
            return;
        }

        // Step 2: Get or create category
        const categoryId = await this.getCategories();
        if (!categoryId) {
            console.error('❌ Cannot proceed without category');
            return;
        }

        // Step 3: Create product
        const product = await this.createTestProduct(categoryId);
        if (!product) {
            console.error('❌ Product creation failed');
            return;
        }

        // Step 4: Retrieve product
        const retrievedProduct = await this.getProduct(product.id);
        if (!retrievedProduct) {
            console.error('❌ Product retrieval failed');
            return;
        }

        // Step 5: Update product
        const updatedProduct = await this.updateProduct(product.id);
        if (!updatedProduct) {
            console.error('❌ Product update failed');
            return;
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Login: Success');
        console.log('✅ Category: Success');
        console.log('✅ Product Creation: Success');
        console.log('✅ Product Retrieval: Success');
        console.log('✅ Product Update: Success');
    }
}

// Run the test
if (require.main === module) {
    const tester = new ProductUploadTester();
    tester.runTest().catch(console.error);
}

module.exports = ProductUploadTester;

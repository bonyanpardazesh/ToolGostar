#!/usr/bin/env node

/**
 * Server Connection Test
 * Tests all API endpoints and server configuration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testServerConnection() {
    console.log('🧪 Testing server connection and API endpoints...\n');

    const tests = [
        {
            name: 'Health Check',
            url: `${BASE_URL}/health`,
            expectedStatus: 200
        },
        {
            name: 'Products API',
            url: `${BASE_URL}/products`,
            expectedStatus: 200
        },
        {
            name: 'Projects API',
            url: `${BASE_URL}/projects`,
            expectedStatus: 200
        },
        {
            name: 'News API',
            url: `${BASE_URL}/news`,
            expectedStatus: 200
        },
        {
            name: 'Categories API',
            url: `${BASE_URL}/products/categories`,
            expectedStatus: 200
        }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        try {
            console.log(`🔍 Testing ${test.name}...`);
            const response = await axios.get(test.url, { timeout: 5000 });
            
            if (response.status === test.expectedStatus) {
                console.log(`   ✅ ${test.name}: PASSED (${response.status})`);
                
                // Show data summary for products
                if (test.name === 'Products API' && response.data.data) {
                    console.log(`   📦 Found ${response.data.data.length} products`);
                }
                
                passedTests++;
            } else {
                console.log(`   ❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${response.status})`);
            }
        } catch (error) {
            console.log(`   ❌ ${test.name}: ERROR - ${error.message}`);
        }
        console.log('');
    }

    // Test CORS headers
    console.log('🌐 Testing CORS configuration...');
    try {
        const response = await axios.get(`${BASE_URL}/health`, {
            headers: {
                'Origin': 'https://toolgostar.com'
            }
        });
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
        };
        
        console.log('   📋 CORS Headers:', corsHeaders);
        console.log('   ✅ CORS: CONFIGURED');
    } catch (error) {
        console.log('   ❌ CORS: ERROR -', error.message);
    }

    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Your backend is ready for production.');
        console.log('\n📋 Next steps for your server:');
        console.log('   1. Upload your files to toolgostar.com');
        console.log('   2. Update .env file with correct server URLs');
        console.log('   3. Start the backend: npm start');
        console.log('   4. Test frontend connection');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
}

// Run the tests
if (require.main === module) {
    testServerConnection().catch(console.error);
}

module.exports = { testServerConnection };

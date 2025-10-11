/**
 * Contact API Test Script
 * Tests the contact form submission endpoint
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testContactAPI() {
  console.log('🧪 Testing Contact API...\n');

  // Test data
  const testContactData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Test Company',
    industry: 'manufacturing',
    projectType: 'new-installation',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message from the API test script.',
    urgency: 'medium',
    preferredContactMethod: 'email',
    source: 'website',
    gdprConsent: true,
    marketingConsent: false
  };

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Contact Form Submission
    console.log('2️⃣ Testing contact form submission...');
    const contactResponse = await axios.post(`${API_BASE_URL}/contact/submit`, testContactData);
    console.log('✅ Contact form submission successful:');
    console.log('   Response:', contactResponse.data);
    console.log('   Contact ID:', contactResponse.data.data?.id);
    console.log('');

    // Test 3: Quote Request Submission
    console.log('3️⃣ Testing quote request submission...');
    const quoteData = {
      contactInfo: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        company: 'Quote Test Company',
        industry: 'chemical',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          country: 'Test Country',
          postalCode: '12345'
        }
      },
      projectDetails: {
        projectType: 'new-installation',
        applicationArea: 'wastewater',
        requiredCapacity: '1000 m³/day',
        timeline: 'within_quarter',
        budget: '100k_500k',
        additionalRequirements: 'Test quote request requirements'
      },
      gdprConsent: true
    };

    const quoteResponse = await axios.post(`${API_BASE_URL}/contact/quote`, quoteData);
    console.log('✅ Quote request submission successful:');
    console.log('   Response:', quoteResponse.data);
    console.log('   Quote ID:', quoteResponse.data.data?.quoteId);
    console.log('');

    console.log('🎉 All tests passed! Contact API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   Network error - is the server running?');
      console.error('   Make sure to start the backend server with: npm run dev');
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testContactAPI();
}

module.exports = testContactAPI;

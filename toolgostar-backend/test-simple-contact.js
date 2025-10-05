/**
 * Simple Contact API Test
 * Tests basic contact form functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testSimpleContact() {
  console.log('🧪 Testing Simple Contact API...\n');

  // Minimal test data
  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subject: 'Test Contact',
    message: 'This is a test message.',
    gdprConsent: true
  };

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Contact form submission
    console.log('\n2️⃣ Testing contact form submission...');
    const contactResponse = await axios.post(`${API_BASE_URL}/contact/submit`, testData);
    console.log('✅ Contact submission successful:', contactResponse.data);

    // Test 3: Get contacts
    console.log('\n3️⃣ Testing get contacts...');
    const contactsResponse = await axios.get(`${API_BASE_URL}/contact`);
    console.log('✅ Get contacts successful:', contactsResponse.data);

    console.log('\n🎉 All tests passed! Contact API is working correctly.');

  } catch (error) {
    console.log('❌ Test failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

// Run test
testSimpleContact();

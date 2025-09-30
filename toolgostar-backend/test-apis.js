const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`);
  log('─'.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testAPI(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      ...testConfig,
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { ...testConfig.headers, ...headers }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message
    };
  }
}

async function runAllTests() {
  log(`${colors.bold}🚀 Starting ToolGostar API Tests${colors.reset}`);
  log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  logTest('Health Check');
  totalTests++;
  const healthResult = await testAPI('GET', '/health');
  if (healthResult.success && healthResult.status === 200) {
    logSuccess('Health check passed');
    logInfo(`Response: ${JSON.stringify(healthResult.data)}`);
    passedTests++;
  } else {
    logError(`Health check failed: ${JSON.stringify(healthResult.error)}`);
  }

  // Test 2: Authentication - Login
  logTest('Authentication - Login');
  totalTests++;
  const loginData = {
    email: 'admin@toolgostar.com',
    password: 'admin123'
  };
  const loginResult = await testAPI('POST', '/auth/login', loginData);
  if (loginResult.success && loginResult.status === 200) {
    logSuccess('Login successful');
    logInfo(`Token received: ${loginResult.data.data?.token ? 'Yes' : 'No'}`);
    passedTests++;
    
    // Store token for authenticated requests
    global.authToken = loginResult.data.data?.token;
  } else {
    logError(`Login failed: ${JSON.stringify(loginResult.error)}`);
  }

  // Test 3: Authentication - Get Profile (if login was successful)
  if (global.authToken) {
    logTest('Authentication - Get Profile');
    totalTests++;
    const profileResult = await testAPI('GET', '/auth/profile', null, {
      'Authorization': `Bearer ${global.authToken}`
    });
    if (profileResult.success && profileResult.status === 200) {
      logSuccess('Profile retrieval successful');
      logInfo(`User: ${profileResult.data.user?.email || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Profile retrieval failed: ${JSON.stringify(profileResult.error)}`);
    }
  }

  // Test 4: Products - Get All
  logTest('Products - Get All');
  totalTests++;
  const productsResult = await testAPI('GET', '/products');
  if (productsResult.success && productsResult.status === 200) {
    logSuccess('Products retrieval successful');
    logInfo(`Products count: ${productsResult.data.products?.length || 0}`);
    passedTests++;
  } else {
    logError(`Products retrieval failed: ${JSON.stringify(productsResult.error)}`);
  }

  // Test 5: Products - Get Single (if products exist)
  if (productsResult?.success && productsResult.data.products?.length > 0) {
    logTest('Products - Get Single');
    totalTests++;
    const productId = productsResult.data.products[0].id;
    const singleProductResult = await testAPI('GET', `/products/${productId}`);
    if (singleProductResult.success && singleProductResult.status === 200) {
      logSuccess('Single product retrieval successful');
      logInfo(`Product: ${singleProductResult.data.product?.name || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Single product retrieval failed: ${JSON.stringify(singleProductResult.error)}`);
    }
  }

  // Test 6: Projects - Get All
  logTest('Projects - Get All');
  totalTests++;
  const projectsResult = await testAPI('GET', '/projects');
  if (projectsResult.success && projectsResult.status === 200) {
    logSuccess('Projects retrieval successful');
    logInfo(`Projects count: ${projectsResult.data.projects?.length || 0}`);
    passedTests++;
  } else {
    logError(`Projects retrieval failed: ${JSON.stringify(projectsResult.error)}`);
  }

  // Test 7: Projects - Get Single (if projects exist)
  if (projectsResult?.success && projectsResult.data.projects?.length > 0) {
    logTest('Projects - Get Single');
    totalTests++;
    const projectId = projectsResult.data.projects[0].id;
    const singleProjectResult = await testAPI('GET', `/projects/${projectId}`);
    if (singleProjectResult.success && singleProjectResult.status === 200) {
      logSuccess('Single project retrieval successful');
      logInfo(`Project: ${singleProjectResult.data.project?.title || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Single project retrieval failed: ${JSON.stringify(singleProjectResult.error)}`);
    }
  }

  // Test 8: Contact - Submit New Contact (Public)
  logTest('Contact - Submit New Contact (Public)');
  totalTests++;
  const newContactData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    company: 'Test Company',
    subject: 'API Test Contact',
    message: 'This is a test contact created via API testing',
    phone: '+1234567890',
    gdprConsent: true
  };
  const createContactResult = await testAPI('POST', '/contact/submit', newContactData);
  if (createContactResult.success && createContactResult.status === 201) {
    logSuccess('Contact creation successful');
    logInfo(`Contact ID: ${createContactResult.data.contact?.id || 'Unknown'}`);
    passedTests++;
    global.newContactId = createContactResult.data.contact?.id;
  } else {
    logError(`Contact creation failed: ${JSON.stringify(createContactResult.error)}`);
  }

  // Test 9: Contact - Get All (Authenticated)
  if (global.authToken) {
    logTest('Contact - Get All (Authenticated)');
    totalTests++;
    const contactsResult = await testAPI('GET', '/contact', null, {
      'Authorization': `Bearer ${global.authToken}`
    });
    if (contactsResult.success && contactsResult.status === 200) {
      logSuccess('Contacts retrieval successful');
      logInfo(`Contacts count: ${contactsResult.data.contacts?.length || 0}`);
      passedTests++;
    } else {
      logError(`Contacts retrieval failed: ${JSON.stringify(contactsResult.error)}`);
    }
  }

  // Test 10: Contact - Get Single (if authenticated and contacts exist)
  if (global.authToken && global.newContactId) {
    logTest('Contact - Get Single (Authenticated)');
    totalTests++;
    const singleContactResult = await testAPI('GET', `/contact/${global.newContactId}`, null, {
      'Authorization': `Bearer ${global.authToken}`
    });
    if (singleContactResult.success && singleContactResult.status === 200) {
      logSuccess('Single contact retrieval successful');
      logInfo(`Contact: ${singleContactResult.data.contact?.firstName || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Single contact retrieval failed: ${JSON.stringify(singleContactResult.error)}`);
    }
  }

  // Test 11: Products - Create New (if authenticated)
  if (global.authToken) {
    logTest('Products - Create New (Authenticated)');
    totalTests++;
    const newProductData = {
      name: 'Test Product',
      description: 'This is a test product created via API',
      category: 'test',
      capacity: '1000 L/day',
      powerRange: '1-5 HP',
      features: ['Test Feature 1', 'Test Feature 2'],
      applications: ['Test Application'],
      specifications: {
        material: 'Stainless Steel',
        warranty: '2 years'
      }
    };
    const createProductResult = await testAPI('POST', '/products', newProductData, {
      'Authorization': `Bearer ${global.authToken}`
    });
    if (createProductResult.success && createProductResult.status === 201) {
      logSuccess('Product creation successful');
      logInfo(`Product ID: ${createProductResult.data.product?.id || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Product creation failed: ${JSON.stringify(createProductResult.error)}`);
    }
  }

  // Test 12: Projects - Create New (if authenticated)
  if (global.authToken) {
    logTest('Projects - Create New (Authenticated)');
    totalTests++;
    const newProjectData = {
      title: 'Test Project',
      description: 'This is a test project created via API',
      client: 'Test Client',
      location: 'Test Location',
      capacity: '5000 L/day',
      status: 'completed',
      completionDate: new Date().toISOString(),
      equipmentUsed: ['Test Equipment 1', 'Test Equipment 2']
    };
    const createProjectResult = await testAPI('POST', '/projects', newProjectData, {
      'Authorization': `Bearer ${global.authToken}`
    });
    if (createProjectResult.success && createProjectResult.status === 201) {
      logSuccess('Project creation successful');
      logInfo(`Project ID: ${createProjectResult.data.project?.id || 'Unknown'}`);
      passedTests++;
    } else {
      logError(`Project creation failed: ${JSON.stringify(createProjectResult.error)}`);
    }
  }

  // Test 13: Quote Request - Submit (Public)
  logTest('Quote Request - Submit (Public)');
  totalTests++;
  const quoteData = {
    contactInfo: {
      firstName: 'Quote',
      lastName: 'Requester',
      email: 'quote@example.com',
      company: 'Quote Company',
      phone: '+1234567890',
      industry: 'manufacturing',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        country: 'Iran',
        postalCode: '12345'
      }
    },
    projectDetails: {
      projectType: 'new_installation',
      applicationArea: 'drinking_water',
      requiredCapacity: '10000 L/day',
      budget: '50k_100k',
      timeline: 'within_6_months',
      message: 'This is a test quote request via API'
    },
    gdprConsent: true
  };
  const createQuoteResult = await testAPI('POST', '/contact/quote', quoteData);
  if (createQuoteResult.success && createQuoteResult.status === 201) {
    logSuccess('Quote request submission successful');
    logInfo(`Quote ID: ${createQuoteResult.data.quoteRequest?.id || 'Unknown'}`);
    passedTests++;
  } else {
    logError(`Quote request submission failed: ${JSON.stringify(createQuoteResult.error)}`);
  }

  // Test 14: Authentication - Get Status (Public)
  logTest('Authentication - Get Status (Public)');
  totalTests++;
  const statusResult = await testAPI('GET', '/auth/status');
  if (statusResult.success && statusResult.status === 200) {
    logSuccess('Auth status check successful');
    logInfo(`Status: ${statusResult.data.status || 'Unknown'}`);
    passedTests++;
  } else {
    logError(`Auth status check failed: ${JSON.stringify(statusResult.error)}`);
  }

  // Summary
  log('\n' + '='.repeat(60));
  log(`${colors.bold}📊 Test Summary${colors.reset}`);
  log('='.repeat(60));
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! APIs are working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
  }
}

// Run the tests
runAllTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});

const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login endpoint...');
        const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'admin@toolgostar.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', response.data);
        return response.data.data.token;
    } catch (error) {
        console.log('❌ Login failed!');
        console.log('Error:', error.response?.data || error.message);
        return null;
    }
}

async function testContacts(token) {
    if (!token) {
        console.log('❌ No token available for contacts test');
        return;
    }
    
    try {
        console.log('Testing contacts endpoint...');
        const response = await axios.get('http://localhost:5000/api/v1/contact', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Contacts endpoint successful!');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ Contacts endpoint failed!');
        console.log('Error:', error.response?.data || error.message);
    }
}

async function runTests() {
    const token = await testLogin();
    await testContacts(token);
}

runTests();

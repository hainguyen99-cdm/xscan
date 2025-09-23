const fetch = require('node-fetch');

async function testSettingsBehaviorEndpoint() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing settings behavior endpoint...');
  
  try {
    // Test if the server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    
    if (!healthResponse.ok) {
      console.error('❌ Server is not running or not accessible');
      console.log('Please start the backend server with: npm run start:dev');
      return;
    }
    
    console.log('✅ Server is running');
    
    // Test the settings behavior endpoint (without auth for now)
    console.log('2. Testing settings behavior endpoint...');
    const response = await fetch(`${baseUrl}/obs-settings/settings-behavior`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Endpoint exists but requires authentication (expected)');
    } else if (response.status === 200) {
      console.log('✅ Endpoint is working');
    } else {
      console.log('⚠️ Unexpected response:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('Make sure the backend server is running on port 3001');
    console.log('Start it with: cd backend && npm run start:dev');
  }
}

testSettingsBehaviorEndpoint();

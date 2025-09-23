// Simple test script to check the settings behavior API
// Run this in the browser console on the frontend

async function testSettingsBehaviorAPI() {
  console.log('🧪 Testing settings behavior API...');
  
  try {
    // Test GET endpoint
    console.log('1. Testing GET /api/obs-settings/settings-behavior');
    const getResponse = await fetch('/api/obs-settings/settings-behavior', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    const getText = await getResponse.text();
    console.log('GET Response body:', getText);
    
    if (getResponse.ok) {
      const getData = JSON.parse(getText);
      console.log('✅ GET request successful:', getData);
    } else {
      console.log('❌ GET request failed:', getResponse.status, getText);
    }
    
    // Test PUT endpoint
    console.log('2. Testing PUT /api/obs-settings/settings-behavior');
    const putResponse = await fetch('/api/obs-settings/settings-behavior', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settingsBehavior: 'auto' }),
    });
    
    console.log('PUT Response status:', putResponse.status);
    console.log('PUT Response headers:', Object.fromEntries(putResponse.headers.entries()));
    
    const putText = await putResponse.text();
    console.log('PUT Response body:', putText);
    
    if (putResponse.ok) {
      const putData = JSON.parse(putText);
      console.log('✅ PUT request successful:', putData);
    } else {
      console.log('❌ PUT request failed:', putResponse.status, putText);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the test
testSettingsBehaviorAPI();

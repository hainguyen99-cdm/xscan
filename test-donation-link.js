const fetch = require('node-fetch');

async function testDonationLink() {
  try {
    console.log('Testing donation link endpoint...');
    
    // Test the backend directly
    const response = await fetch('http://localhost:3001/api/donations/links/slug/haistream', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error testing donation link:', error.message);
  }
}

testDonationLink();

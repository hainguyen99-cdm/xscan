const axios = require('axios');

// Test configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_ALERT_TOKEN = process.env.TEST_ALERT_TOKEN || 'your_test_alert_token_here';

// Test donation alert data
const testDonationData = {
  donorName: 'Test Donor',
  amount: '25.00',
  currency: 'USD',
  message: 'This is a test donation alert!',
  donationId: 'test_donation_123',
  paymentMethod: 'stripe',
  isAnonymous: false,
  transactionId: 'txn_test_123',
  metadata: {
    test: true,
    timestamp: new Date().toISOString()
  }
};

async function testDonationAlert() {
  try {
    console.log('🧪 Testing Donation Alert Endpoint');
    console.log('=====================================');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Alert Token: ${TEST_ALERT_TOKEN.substring(0, 8)}...`);
    console.log('');

    // Test the donation alert endpoint
    console.log('📤 Sending donation alert request...');
    const response = await axios.post(
      `${BACKEND_URL}/obs-settings/widget/${TEST_ALERT_TOKEN}/donation-alert`,
      testDonationData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log('✅ Donation alert request successful!');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Validate response structure
    const requiredFields = ['success', 'alertId', 'streamerId', 'alertData', 'widgetUrl', 'message', 'connectedWidgets'];
    const missingFields = requiredFields.filter(field => !(field in response.data));
    
    if (missingFields.length > 0) {
      console.log('⚠️  Missing response fields:', missingFields);
    } else {
      console.log('✅ All required response fields present');
    }

    // Test rate limiting
    console.log('');
    console.log('🔄 Testing rate limiting...');
    
    const promises = Array(12).fill().map((_, i) => 
      axios.post(
        `${BACKEND_URL}/obs-settings/widget/${TEST_ALERT_TOKEN}/donation-alert`,
        { ...testDonationData, donationId: `test_donation_${i}` },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        }
      ).catch(err => ({ error: true, status: err.response?.status, message: err.response?.data?.message || err.message }))
    );

    const results = await Promise.all(promises);
    const successful = results.filter(r => !r.error).length;
    const rateLimited = results.filter(r => r.error && r.message?.includes('Rate limit')).length;
    const otherErrors = results.filter(r => r.error && !r.message?.includes('Rate limit')).length;

    console.log(`📈 Rate limiting test results:`);
    console.log(`   - Successful requests: ${successful}`);
    console.log(`   - Rate limited: ${rateLimited}`);
    console.log(`   - Other errors: ${otherErrors}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Test validation
async function testValidation() {
  try {
    console.log('');
    console.log('🔍 Testing Input Validation');
    console.log('============================');

    // Test missing required fields
    console.log('📝 Testing missing required fields...');
    try {
      await axios.post(
        `${BACKEND_URL}/obs-settings/widget/${TEST_ALERT_TOKEN}/donation-alert`,
        { donorName: 'Test' }, // Missing amount and currency
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('❌ Should have failed with missing fields');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Properly rejected request with missing fields');
      } else {
        console.log('⚠️  Unexpected error for missing fields:', error.response?.status);
      }
    }

    // Test invalid amount
    console.log('💰 Testing invalid amount...');
    try {
      await axios.post(
        `${BACKEND_URL}/obs-settings/widget/${TEST_ALERT_TOKEN}/donation-alert`,
        { ...testDonationData, amount: 'invalid' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('❌ Should have failed with invalid amount');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Properly rejected request with invalid amount');
      } else {
        console.log('⚠️  Unexpected error for invalid amount:', error.response?.status);
      }
    }

    // Test invalid currency
    console.log('🌍 Testing invalid currency...');
    try {
      await axios.post(
        `${BACKEND_URL}/obs-settings/widget/${TEST_ALERT_TOKEN}/donation-alert`,
        { ...testDonationData, currency: 'INVALID' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('❌ Should have failed with invalid currency');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Properly rejected request with invalid currency');
      } else {
        console.log('⚠️  Unexpected error for invalid currency:', error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Donation Alert Endpoint Tests');
  console.log('==========================================');
  console.log('');

  await testDonationAlert();
  await testValidation();

  console.log('');
  console.log('🎉 All tests completed!');
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.error('❌ Axios is required for testing. Install it with: npm install axios');
  process.exit(1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDonationAlert, testValidation }; 
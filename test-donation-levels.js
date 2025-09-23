// Test script for donation level functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGNkZGEwMDJkMTA2MGUwZjcwYTI4YTAiLCJyb2xlIjoic3RyZWFtZXIiLCJpYXQiOjE3NTgzMjExNTIsImV4cCI6MTc1ODQwNzU1Mn0.OA1SEysmGyCQA2F9VOEkx4BDZGkKYThSZ863YjyCRAg';

async function testDonationLevels() {
  try {
    console.log('🧪 Testing Donation Level System...\n');

    // 1. Get current donation levels
    console.log('1️⃣ Getting current donation levels...');
    const getResponse = await axios.get(`${BASE_URL}/api/obs-settings/donation-levels`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Current levels:', JSON.stringify(getResponse.data, null, 2));

    // 2. Create multiple donation levels
    console.log('\n2️⃣ Creating multiple donation levels...');
    const donationLevels = [
      {
        levelId: 'basic_level',
        levelName: 'Basic Donation',
        minAmount: 0,
        maxAmount: 50000,
        currency: 'VND',
        isEnabled: true,
        configuration: {
          styleSettings: {
            backgroundColor: '#4CAF50',
            textColor: '#ffffff',
            fontSize: 16
          },
          displaySettings: {
            duration: 5000
          }
        }
      },
      {
        levelId: 'premium_level',
        levelName: 'Premium Donation',
        minAmount: 50000,
        maxAmount: 100000,
        currency: 'VND',
        isEnabled: true,
        configuration: {
          styleSettings: {
            backgroundColor: '#ff6b6b',
            textColor: '#ffffff',
            fontSize: 20
          },
          displaySettings: {
            duration: 8000
          },
          animationSettings: {
            animationType: 'bounce',
            duration: 1000
          }
        }
      },
      {
        levelId: 'vip_level',
        levelName: 'VIP Donation',
        minAmount: 100000,
        maxAmount: 1000000,
        currency: 'VND',
        isEnabled: true,
        configuration: {
          styleSettings: {
            backgroundColor: '#9C27B0',
            textColor: '#FFD700',
            fontSize: 24
          },
          displaySettings: {
            duration: 10000
          },
          animationSettings: {
            animationType: 'zoom',
            duration: 1500
          }
        }
      }
    ];

    const updateResponse = await axios.put(`${BASE_URL}/api/obs-settings/donation-levels`, {
      donationLevels
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Levels created:', updateResponse.data.message);

    // 3. Test each level
    console.log('\n3️⃣ Testing each donation level...');
    
    const testCases = [
      { levelId: 'basic_level', amount: '25000', description: 'Basic level (25,000 VND)' },
      { levelId: 'premium_level', amount: '75000', description: 'Premium level (75,000 VND)' },
      { levelId: 'vip_level', amount: '150000', description: 'VIP level (150,000 VND)' }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing ${testCase.description}...`);
      try {
        const testResponse = await axios.post(`${BASE_URL}/api/obs-settings/test-donation-level`, {
          levelId: testCase.levelId,
          donorName: `Test Donor ${testCase.amount}`,
          amount: testCase.amount,
          currency: 'VND',
          message: `Testing ${testCase.description}`
        }, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log(`✅ ${testCase.description} test sent:`, testResponse.data.message);
      } catch (error) {
        console.log(`❌ ${testCase.description} test failed:`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Donation level testing completed!');
    console.log('\n📝 Summary:');
    console.log('- Basic Level: 0-50,000 VND (Green background, 5s duration)');
    console.log('- Premium Level: 50,000-100,000 VND (Red background, bounce animation, 8s duration)');
    console.log('- VIP Level: 100,000+ VND (Purple background, gold text, zoom animation, 10s duration)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDonationLevels();

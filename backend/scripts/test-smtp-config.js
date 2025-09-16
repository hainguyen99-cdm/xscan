#!/usr/bin/env node

/**
 * SMTP Configuration Test Script
 * 
 * This script helps you test different SMTP configurations
 * without restarting your application.
 */

const nodemailer = require('nodemailer');

// Test configurations
const smtpConfigs = {
  // Gmail with App Password (recommended for development)
  gmailAppPassword: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  // Gmail with OAuth2 (for production)
  gmailOAuth2: {
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      clientId: process.env.GMAIL_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || 'your-client-secret',
      refreshToken: process.env.GMAIL_REFRESH_TOKEN || 'your-refresh-token',
      accessToken: process.env.GMAIL_ACCESS_TOKEN || 'your-access-token',
    },
  },

  // Outlook/Hotmail
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'your-email@outlook.com',
      pass: process.env.SMTP_PASS || 'your-password',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  // Yahoo
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'your-email@yahoo.com',
      pass: process.env.SMTP_PASS || 'your-app-password',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },

  // Ethereal (fake SMTP for testing)
  ethereal: {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal-user', // Will be replaced with actual test account
      pass: 'ethereal-pass', // Will be replaced with actual test account
    },
  },

  // Custom SMTP server
  custom: {
    host: process.env.SMTP_HOST || 'smtp.your-server.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'your-username',
      pass: process.env.SMTP_PASS || 'your-password',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
};

async function testSmtpConfig(configName, config) {
  console.log(`\n🧪 Testing ${configName} configuration...`);
  console.log('=' .repeat(50));

  try {
    let transporter;

    // Special handling for Ethereal
    if (configName === 'ethereal') {
      console.log('Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      config.auth.user = testAccount.user;
      config.auth.pass = testAccount.pass;
      console.log(`✅ Test account created: ${testAccount.user}`);
      console.log(`📧 View emails at: https://ethereal.email`);
    }

    // Create transporter
    transporter = nodemailer.createTransporter(config);

    // Test connection
    console.log('Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');

    // Test sending email (if not Ethereal, send to yourself)
    if (configName !== 'ethereal') {
      const testEmail = {
        from: config.auth.user,
        to: config.auth.user, // Send to yourself
        subject: `SMTP Test - ${configName}`,
        text: `This is a test email from ${configName} configuration.\n\nSent at: ${new Date().toISOString()}`,
        html: `
          <h2>SMTP Test - ${configName}</h2>
          <p>This is a test email from <strong>${configName}</strong> configuration.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666;">If you receive this email, your SMTP configuration is working correctly!</p>
        `,
      };

      console.log('Sending test email...');
      const info = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Message ID: ${info.messageId}`);
    } else {
      // For Ethereal, send to a test recipient
      const testEmail = {
        from: config.auth.user,
        to: 'test@example.com',
        subject: `SMTP Test - ${configName}`,
        text: `This is a test email from ${configName} configuration.`,
      };

      console.log('Sending test email to Ethereal...');
      const info = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent to Ethereal!');
      console.log(`📧 Message ID: ${info.messageId}`);
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, configName };

  } catch (error) {
    console.log('❌ Configuration failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.code) {
      console.log(`   Code: ${error.code}`);
    }
    
    if (error.response) {
      console.log(`   Response: ${error.response}`);
    }

    return { success: false, configName, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 SMTP Configuration Test Suite');
  console.log('=====================================');
  console.log('This script will test various SMTP configurations');
  console.log('Make sure to set your environment variables first!\n');

  const results = [];

  // Test each configuration
  for (const [configName, config] of Object.entries(smtpConfigs)) {
    const result = await testSmtpConfig(configName, config);
    results.push(result);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`   - ${r.configName}`));

  console.log(`❌ Failed: ${failed.length}`);
  failed.forEach(r => console.log(`   - ${r.configName}: ${r.error}`));

  if (successful.length > 0) {
    console.log('\n🎉 You have working SMTP configurations!');
    console.log('Use one of the successful configurations in your .env file.');
  } else {
    console.log('\n⚠️  No working SMTP configurations found.');
    console.log('Check your credentials and network connectivity.');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const configName = args[0];
  if (smtpConfigs[configName]) {
    console.log(`🧪 Testing only ${configName} configuration...`);
    testSmtpConfig(configName, smtpConfigs[configName])
      .then(result => {
        if (result.success) {
          console.log(`\n✅ ${configName} configuration is working!`);
          process.exit(0);
        } else {
          console.log(`\n❌ ${configName} configuration failed: ${result.error}`);
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('Script error:', error);
        process.exit(1);
      });
  } else {
    console.log(`❌ Unknown configuration: ${configName}`);
    console.log('Available configurations:', Object.keys(smtpConfigs).join(', '));
    process.exit(1);
  }
} else {
  // Run all tests
  runTests().catch(error => {
    console.error('Script error:', error);
    process.exit(1);
  });
} 
#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function testEmailConfiguration() {
    console.log('🔧 Testing Gmail SMTP Configuration...\n');
    const requiredEnvVars = [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'GMAIL_CLIENT_ID',
        'GMAIL_CLIENT_SECRET'
    ];
    console.log('📋 Environment Variables Check:');
    for (const envVar of requiredEnvVars) {
        const value = process.env[envVar];
        if (value) {
            console.log(`✅ ${envVar}: ${envVar.includes('PASS') || envVar.includes('SECRET') ? '***' : value}`);
        }
        else {
            console.log(`❌ ${envVar}: Not set`);
        }
    }
    console.log('');
    console.log('📧 Testing Traditional SMTP Connection...');
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');
        console.log('📤 Testing email sending...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: 'Gmail SMTP Test - XScan Backend',
            html: `
        <h2>🎉 Gmail SMTP Configuration Test Successful!</h2>
        <p>This email confirms that your Gmail SMTP configuration is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>User: ${process.env.SMTP_USER}</li>
          <li>From: ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
        </ul>
        <p><em>Sent at: ${new Date().toISOString()}</em></p>
      `,
        });
        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📨 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    catch (error) {
        console.error('❌ SMTP connection failed:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Troubleshooting Tips:');
            console.log('1. Verify your Gmail username and password');
            console.log('2. Ensure 2-Factor Authentication is enabled');
            console.log('3. Generate an App Password for this application');
            console.log('4. Check that "Less secure app access" is disabled');
        }
        else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Troubleshooting Tips:');
            console.log('1. Check your internet connection');
            console.log('2. Verify the SMTP host and port');
            console.log('3. Check if port 587 is blocked by firewall');
        }
        process.exit(1);
    }
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
        console.log('\n🔐 Gmail OAuth2 Configuration Check:');
        console.log('✅ OAuth2 credentials are configured');
        console.log('💡 Note: Full OAuth2 flow requires additional implementation');
        console.log('   For now, using App Password authentication');
    }
    console.log('\n🎯 Configuration Summary:');
    console.log('✅ Gmail SMTP is properly configured');
    console.log('✅ Email service is ready to use');
    console.log('✅ Test email sent successfully');
    console.log('\n📚 Next Steps:');
    console.log('1. Update your .env file with your actual Gmail credentials');
    console.log('2. Test the email service in your application');
    console.log('3. Implement email templates for your use cases');
    console.log('4. Set up email queuing for production use');
    console.log('\n🚀 Gmail SMTP Configuration Complete!');
}
testEmailConfiguration().catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-email.js.map
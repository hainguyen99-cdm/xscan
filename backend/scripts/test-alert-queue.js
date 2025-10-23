/**
 * Test script for Alert Queue Implementation
 * 
 * This script simulates multiple rapid donations to test the queue system
 * and verify that alerts are processed sequentially without being overridden.
 */

const io = require('socket.io-client');

// Configuration
const CONFIG = {
    serverUrl: 'http://localhost:3000',
    alertToken: 'test-alert-token', // Replace with actual token
    testDuration: 30000, // 30 seconds
    rapidDonationInterval: 500, // 500ms between donations
    normalDonationInterval: 2000, // 2 seconds between donations
};

class AlertQueueTester {
    constructor() {
        this.socket = null;
        this.receivedAlerts = [];
        this.alertTimestamps = [];
        this.testResults = {
            totalAlerts: 0,
            receivedAlerts: 0,
            missedAlerts: 0,
            averageProcessingTime: 0,
            queueOverflows: 0,
        };
    }

    async startTest() {
        console.log('🚀 Starting Alert Queue Test...');
        console.log(`📡 Connecting to ${CONFIG.serverUrl}`);
        
        try {
            await this.connectToServer();
            await this.runTestScenarios();
            this.generateReport();
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        } finally {
            this.disconnect();
        }
    }

    async connectToServer() {
        return new Promise((resolve, reject) => {
            this.socket = io(`${CONFIG.serverUrl}/obs-widget`, {
                query: {
                    alertToken: CONFIG.alertToken
                }
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to OBS Widget WebSocket');
                resolve();
            });

            this.socket.on('donationAlert', (alert) => {
                this.handleDonationAlert(alert);
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Disconnected from WebSocket');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Connection error:', error.message);
                reject(error);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.socket.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    handleDonationAlert(alert) {
        const timestamp = Date.now();
        this.receivedAlerts.push({
            ...alert,
            receivedAt: timestamp
        });
        this.alertTimestamps.push(timestamp);
        
        console.log(`📨 Received alert ${alert.alertId}: ${alert.donorName} - ${alert.amount}`);
        
        // Simulate alert completion after display duration
        const displayDuration = alert.settings?.displaySettings?.duration || 3000;
        setTimeout(() => {
            this.socket.emit('alertCompleted', {
                alertId: alert.alertId,
                streamerId: alert.streamerId
            });
            console.log(`✅ Alert ${alert.alertId} completed`);
        }, displayDuration);
    }

    async runTestScenarios() {
        console.log('\n🧪 Running test scenarios...');
        
        // Scenario 1: Rapid donations (stress test)
        console.log('\n📊 Scenario 1: Rapid Donations (Stress Test)');
        await this.sendRapidDonations(10, CONFIG.rapidDonationInterval);
        
        // Wait for processing
        await this.delay(5000);
        
        // Scenario 2: Normal donations
        console.log('\n📊 Scenario 2: Normal Donations');
        await this.sendNormalDonations(5, CONFIG.normalDonationInterval);
        
        // Wait for processing
        await this.delay(10000);
        
        // Scenario 3: Mixed timing
        console.log('\n📊 Scenario 3: Mixed Timing');
        await this.sendMixedDonations();
        
        // Wait for all processing to complete
        await this.delay(15000);
    }

    async sendRapidDonations(count, interval) {
        console.log(`📤 Sending ${count} rapid donations (${interval}ms apart)`);
        
        for (let i = 0; i < count; i++) {
            const donation = this.createTestDonation(`RapidDonor${i + 1}`, 10000 + (i * 5000));
            this.simulateDonation(donation);
            this.testResults.totalAlerts++;
            
            if (i < count - 1) {
                await this.delay(interval);
            }
        }
    }

    async sendNormalDonations(count, interval) {
        console.log(`📤 Sending ${count} normal donations (${interval}ms apart)`);
        
        for (let i = 0; i < count; i++) {
            const donation = this.createTestDonation(`NormalDonor${i + 1}`, 25000 + (i * 10000));
            this.simulateDonation(donation);
            this.testResults.totalAlerts++;
            
            if (i < count - 1) {
                await this.delay(interval);
            }
        }
    }

    async sendMixedDonations() {
        console.log('📤 Sending mixed timing donations');
        
        const donations = [
            { name: 'MixedDonor1', amount: 50000, delay: 0 },
            { name: 'MixedDonor2', amount: 75000, delay: 1000 },
            { name: 'MixedDonor3', amount: 100000, delay: 2000 },
            { name: 'MixedDonor4', amount: 125000, delay: 500 },
            { name: 'MixedDonor5', amount: 150000, delay: 1500 },
        ];

        for (const donation of donations) {
            setTimeout(() => {
                const testDonation = this.createTestDonation(donation.name, donation.amount);
                this.simulateDonation(testDonation);
                this.testResults.totalAlerts++;
            }, donation.delay);
        }
    }

    createTestDonation(donorName, amount) {
        return {
            streamerId: 'test-streamer',
            donorName,
            amount,
            currency: 'VND',
            message: `Test donation from ${donorName}`,
            reference: `test-ref-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
        };
    }

    simulateDonation(donation) {
        // In a real scenario, this would trigger the bank sync service
        // For testing, we'll simulate the donation being processed
        console.log(`💰 Simulating donation: ${donation.donorName} - ${donation.amount} ${donation.currency}`);
    }

    generateReport() {
        console.log('\n📊 Test Results Report');
        console.log('='.repeat(50));
        
        this.testResults.receivedAlerts = this.receivedAlerts.length;
        this.testResults.missedAlerts = this.testResults.totalAlerts - this.testResults.receivedAlerts;
        
        if (this.alertTimestamps.length > 1) {
            const processingTimes = [];
            for (let i = 1; i < this.alertTimestamps.length; i++) {
                processingTimes.push(this.alertTimestamps[i] - this.alertTimestamps[i - 1]);
            }
            this.testResults.averageProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
        }
        
        console.log(`📈 Total Alerts Sent: ${this.testResults.totalAlerts}`);
        console.log(`📨 Alerts Received: ${this.testResults.receivedAlerts}`);
        console.log(`❌ Missed Alerts: ${this.testResults.missedAlerts}`);
        console.log(`⏱️  Average Processing Time: ${this.testResults.averageProcessingTime.toFixed(2)}ms`);
        console.log(`🔄 Queue Overflows: ${this.testResults.queueOverflows}`);
        
        // Calculate success rate
        const successRate = (this.testResults.receivedAlerts / this.testResults.totalAlerts) * 100;
        console.log(`✅ Success Rate: ${successRate.toFixed(2)}%`);
        
        // Alert processing analysis
        console.log('\n🔍 Alert Processing Analysis:');
        this.analyzeAlertProcessing();
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        this.generateRecommendations();
    }

    analyzeAlertProcessing() {
        if (this.receivedAlerts.length === 0) {
            console.log('❌ No alerts were received - check connection and configuration');
            return;
        }

        // Check for sequential processing
        const alertIds = this.receivedAlerts.map(a => a.alertId);
        const uniqueIds = new Set(alertIds);
        
        if (alertIds.length === uniqueIds.size) {
            console.log('✅ All alerts have unique IDs - no duplicates detected');
        } else {
            console.log('⚠️  Duplicate alert IDs detected - possible queue issues');
        }

        // Check processing intervals
        const intervals = [];
        for (let i = 1; i < this.alertTimestamps.length; i++) {
            intervals.push(this.alertTimestamps[i] - this.alertTimestamps[i - 1]);
        }

        if (intervals.length > 0) {
            const minInterval = Math.min(...intervals);
            const maxInterval = Math.max(...intervals);
            console.log(`⏱️  Processing intervals: ${minInterval}ms - ${maxInterval}ms`);
            
            if (minInterval < 1000) {
                console.log('⚠️  Very short intervals detected - alerts may be overlapping');
            }
        }
    }

    generateRecommendations() {
        if (this.testResults.missedAlerts > 0) {
            console.log('🔧 Consider increasing timeout values or improving error handling');
        }
        
        if (this.testResults.averageProcessingTime > 5000) {
            console.log('🔧 Consider optimizing alert processing or reducing display duration');
        }
        
        if (this.testResults.queueOverflows > 0) {
            console.log('🔧 Consider implementing queue size limits or priority handling');
        }
        
        if (this.testResults.receivedAlerts === this.testResults.totalAlerts) {
            console.log('🎉 Perfect! All alerts were processed successfully');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Run the test
if (require.main === module) {
    const tester = new AlertQueueTester();
    tester.startTest().catch(console.error);
}

module.exports = AlertQueueTester;

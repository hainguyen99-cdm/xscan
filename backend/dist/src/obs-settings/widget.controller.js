"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const obs_settings_service_1 = require("./obs-settings.service");
let WidgetController = class WidgetController {
    constructor(obsSettingsService) {
        this.obsSettingsService = obsSettingsService;
    }
    async getWidgetWithStreamerId(streamerId, alertToken, res) {
        try {
            const settings = await this.obsSettingsService.findByAlertToken(alertToken);
            if (settings.streamerId.toString() !== streamerId) {
                const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OBS Widget Error</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: transparent; 
                color: #ff4444; 
                text-align: center; 
                padding: 20px; 
              }
            </style>
          </head>
          <body>
            <h3>Widget Not Found</h3>
            <p>Invalid streamer ID or alert token.</p>
          </body>
          </html>
        `;
                res.setHeader('Content-Type', 'text/html');
                res.status(common_1.HttpStatus.NOT_FOUND).send(errorHtml);
                return;
            }
            const widgetHtml = this.generateWidgetHtml(settings);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: http: https:");
            res.send(widgetHtml);
        }
        catch (error) {
            const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OBS Widget Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: transparent; 
              color: #ff4444; 
              text-align: center; 
              padding: 20px; 
            }
          </style>
        </head>
        <body>
          <h3>Widget Not Found</h3>
          <p>Invalid streamer ID or alert token.</p>
        </body>
        </html>
      `;
            res.setHeader('Content-Type', 'text/html');
            res.status(common_1.HttpStatus.NOT_FOUND).send(errorHtml);
        }
    }
    async serveWidget(streamerId, alertToken, res) {
        try {
            const settings = await this.obsSettingsService.findByAlertToken(alertToken);
            if (settings.streamerId.toString() !== streamerId) {
                const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OBS Widget Error</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: transparent; 
                color: #ff4444; 
                text-align: center; 
                padding: 20px; 
              }
            </style>
          </head>
          <body>
            <h3>Widget Not Found</h3>
            <p>Invalid streamer ID or alert token.</p>
            <p>Streamer ID: ${streamerId}</p>
            <p>Token: ${alertToken.substring(0, 8)}...</p>
          </body>
          </html>
        `;
                res.setHeader('Content-Type', 'text/html');
                res.status(common_1.HttpStatus.NOT_FOUND).send(errorHtml);
                return;
            }
            const widgetHtml = this.generateWidgetHtml(settings);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: http: https:");
            res.send(widgetHtml);
        }
        catch (error) {
            console.error('Error serving widget:', error);
            const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OBS Widget Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: transparent; 
              color: #ff4444; 
              text-align: center; 
              padding: 20px; 
            }
          </style>
        </head>
        <body>
          <h3>Widget Not Found</h3>
          <p>Invalid or expired alert token.</p>
          <p>Streamer ID: ${streamerId}</p>
          <p>Token: ${alertToken.substring(0, 8)}...</p>
        </body>
        </html>
      `;
            res.setHeader('Content-Type', 'text/html');
            res.status(common_1.HttpStatus.NOT_FOUND).send(errorHtml);
        }
    }
    async getWidget(alertToken, res) {
        try {
            const settings = await this.obsSettingsService.findByAlertToken(alertToken);
            const widgetHtml = this.generateWidgetHtml(settings);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https: http:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: http: https:");
            res.send(widgetHtml);
        }
        catch (error) {
            const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OBS Widget Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: transparent; 
              color: #ff4444; 
              text-align: center; 
              padding: 20px; 
            }
          </style>
        </head>
        <body>
          <h3>Widget Not Found</h3>
          <p>Invalid or expired alert token.</p>
        </body>
        </html>
      `;
            res.setHeader('Content-Type', 'text/html');
            res.status(common_1.HttpStatus.NOT_FOUND).send(errorHtml);
        }
    }
    escapeFontFamily(fontFamily) {
        if (!fontFamily)
            return 'Arial, sans-serif';
        if (fontFamily.includes(',')) {
            return `"${fontFamily}"`;
        }
        return `"${fontFamily}"`;
    }
    generateWidgetHtml(settings) {
        const alertToken = settings.alertToken;
        const streamerId = settings.streamerId;
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const imageSettings = {
            enabled: true,
            mediaType: 'image',
            width: 300,
            height: 200,
            borderRadius: 8,
            shadow: true,
            shadowColor: '#000000',
            shadowBlur: 10,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            ...settings.imageSettings
        };
        const soundSettings = {
            enabled: true,
            volume: 80,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
            ...settings.soundSettings
        };
        const styleSettings = {
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff',
            accentColor: '#00ff00',
            borderColor: '#333333',
            borderWidth: 2,
            borderStyle: 'solid',
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textShadow: true,
            textShadowColor: '#000000',
            textShadowBlur: 3,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
            ...settings.styleSettings
        };
        const positionSettings = {
            x: 100,
            y: 100,
            anchor: 'top-left',
            zIndex: 1000,
            responsive: true,
            mobileScale: 0.8,
            ...settings.positionSettings
        };
        const displaySettings = {
            duration: 5000,
            fadeInDuration: 300,
            fadeOutDuration: 300,
            autoHide: true,
            showProgress: false,
            progressColor: '#00ff00',
            progressHeight: 3,
            ...settings.displaySettings
        };
        const generalSettings = {
            enabled: true,
            maxAlerts: 3,
            alertSpacing: 20,
            cooldown: 1000,
            priority: 'medium',
            ...settings.generalSettings
        };
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OBS Alert Widget</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <meta name="generated" content="${Date.now()}">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${this.escapeFontFamily(styleSettings.fontFamily || 'Arial, sans-serif')};
            background: transparent;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
          }
          
          .widget-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .alert {
            display: none;
            position: absolute;
            background: transparent;
            color: ${styleSettings.textColor};
            padding: 0;
            border-radius: 0;
            box-shadow: none;
            max-width: ${imageSettings.width}px;
            max-height: ${imageSettings.height}px;
            border: none;
            z-index: ${positionSettings.zIndex};
            font-family: ${this.escapeFontFamily(styleSettings.fontFamily)};
            font-size: ${styleSettings.fontSize}px;
            font-weight: ${styleSettings.fontWeight};
            font-style: ${styleSettings.fontStyle};
            text-shadow: ${styleSettings.textShadow ? `${styleSettings.textShadowOffsetX}px ${styleSettings.textShadowOffsetY}px ${styleSettings.textShadowBlur}px ${styleSettings.textShadowColor}` : 'none'};
            
            /* Position based on OBS settings */
            left: ${positionSettings.x}px;
            top: ${positionSettings.y}px;
            
            /* Anchor positioning */
            ${positionSettings.anchor === 'top-center' ? 'left: 50%; transform: translateX(-50%);' : ''}
            ${positionSettings.anchor === 'top-right' ? 'left: auto; right: ' + positionSettings.x + 'px;' : ''}
            ${positionSettings.anchor === 'middle-left' ? 'top: 50%; transform: translateY(-50%);' : ''}
            ${positionSettings.anchor === 'middle-center' ? 'left: 50%; top: 50%; transform: translate(-50%, -50%);' : ''}
            ${positionSettings.anchor === 'middle-right' ? 'left: auto; right: ' + positionSettings.x + 'px; top: 50%; transform: translateY(-50%);' : ''}
            ${positionSettings.anchor === 'bottom-left' ? 'top: auto; bottom: ' + positionSettings.y + 'px;' : ''}
            ${positionSettings.anchor === 'bottom-center' ? 'left: 50%; top: auto; bottom: ' + positionSettings.y + 'px; transform: translateX(-50%);' : ''}
            ${positionSettings.anchor === 'bottom-right' ? 'left: auto; right: ' + positionSettings.x + 'px; top: auto; bottom: ' + positionSettings.y + 'px;' : ''}
            
            ${positionSettings.responsive ? `
              @media (max-width: 768px) {
                transform: scale(${positionSettings.mobileScale});
              }
            ` : ''}
          }
          
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-50px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-50px); }
          }
          
          .alert-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .donor-avatar {
            display: none;
          }
          
          .alert-media {
            display: none;
            width: 100%;
            max-width: ${imageSettings.width}px;
            max-height: ${imageSettings.height}px;
            border-radius: ${imageSettings.borderRadius}px;
            object-fit: contain;
            margin-bottom: 12px;
          }
          
          .donor-name {
            font-size: ${styleSettings.fontSize}px;
            font-weight: ${styleSettings.fontWeight};
            margin: 0;
          }
          
          .donation-verb {
            font-size: ${styleSettings.fontSize}px;
            margin: 0 6px;
            opacity: 0.9;
          }
          
          .donation-line {
            margin: 0;
            font-size: ${styleSettings.fontSize}px;
            font-weight: ${styleSettings.fontWeight};
            display: flex;
            align-items: baseline;
            gap: 6px;
            flex-wrap: nowrap;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .donor-amount {
            font-size: ${Math.floor(styleSettings.fontSize * 1.3)}px;
            font-weight: bold;
            color: ${styleSettings.accentColor};
          }
          
          .donor-message {
            font-size: ${styleSettings.fontSize}px;
            line-height: 1.4;
            opacity: 0.9;
          }
          
          .alert-timestamp {
            display: none;
          }
          
          
          .sound-banner {
            position: absolute;
            left: 10px;
            bottom: 10px;
            background: rgba(0,0,0,0.6);
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            display: none;
            z-index: ${positionSettings.zIndex + 1};
          }
          .sound-banner button {
            margin-left: 8px;
            background: ${styleSettings.accentColor};
            color: #000;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
          }
          .sound-banner button:focus { outline: 2px solid #fff; }
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="widget-container">
          <div class="sound-banner" id="soundBanner" role="region" aria-label="Sound permission">
            <span>Sound is blocked by the browser.</span>
            <button id="enableSoundButton" aria-label="Enable sound">Enable sound</button>
          </div>
          
          <div class="alert" id="alertContainer">
            <img src="" alt="Alert Media" class="alert-media" id="alertMedia">
            <div class="alert-header">
              <h3 id="donationLine" class="donation-line">
                <span id="donorName" class="donor-name">Donor Name</span>
                <span id="donationVerb" class="donation-verb">đã donate</span>
                <span class="donor-amount" id="donorAmount" style="white-space:nowrap; overflow:visible; text-overflow:clip; display:inline-block;">0.00</span>
              </h3>
            </div>
            <div class="donor-message" id="donorMessage">Thank you for your donation!</div>
            <div class="alert-timestamp" id="alertTimestamp"></div>
          </div>
        </div>
        
        <script src="${baseUrl}/socket.io/socket.io.js"></script>
        <script id="widget-script-${Date.now()}" data-version="3.0.0" data-generated="${Date.now()}">
          // ========================================
          // OBS ALERT WIDGET v3.0.0 - SIMPLIFIED
          // Generated at: ${new Date().toISOString()}
          // Build ID: ${Date.now()}
          // ========================================
          
          console.log('🚀 NEW WIDGET SCRIPT LOADED!');
          console.log('🚀 Build ID:', ${Date.now()});
          console.log('🚀 Timestamp:', new Date().toISOString());
          console.log('🚀 This is the SIMPLIFIED version with fadeInOut animation!');
          
          // Widget Version: 3.0.0 - Simplified Animation
          // Generated: ${new Date().toISOString()}
          // Features: Simple fadeInOut animation, no complex hide/show logic
          
          console.log('🔧 Widget script loading... Version 3.0.0');
          console.log('🔧 Timestamp:', new Date().toISOString());
          
          class OBSAlertWidget {
            constructor(alertToken, backendUrl, settings) {
              console.log('🏗️ OBSAlertWidget constructor called');
              console.log('🏗️ AlertToken:', alertToken);
              console.log('🏗️ BackendUrl:', backendUrl);
              
              this.alertToken = alertToken;
              this.backendUrl = backendUrl;
              this.settings = settings;
              this.socket = null;
              this.isConnected = false;
              this.shownAlerts = new Set(); // Simple tracking - just what's been shown
              this.lastAlertTime = 0; // Simple cooldown
              this.alertCooldown = this.settings.generalSettings?.cooldown || 1000; // Use settings cooldown (in ms) or default to 1 second
              this.pendingAudioUrl = null; // For retrying audio after user gesture
              this.audioEnabled = false; // Flag to track if audio is enabled globally
              this._soundClickBound = false; // Flag to prevent multiple listeners
              this._audioCtxTested = false; // Flag to prevent multiple WebAudioContext tests
              this._shouldAutoEnableSound = this.isOBSEnvironment() || this.hasForceAutoplayFlag() || (this.settings?.generalSettings?.forceAutoplay === true);
              
              // Wait for DOM to be ready before accessing elements
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                  this.setupElements();
                  this.bindUserGestureUnlock();
                  this.restoreSoundPreference();
                  this.init();
                });
              } else {
                this.setupElements();
                this.bindUserGestureUnlock();
                this.restoreSoundPreference();
                this.init();
              }
            }
            
            setupElements() {
              this.alertContainer = document.getElementById('alertContainer');
              this.alertMedia = document.getElementById('alertMedia');
              this.soundBanner = document.getElementById('soundBanner');
              this.enableSoundButton = document.getElementById('enableSoundButton');
              
              // Safety check - ensure elements exist
              if (!this.alertContainer) {
                console.error('❌ alertContainer element not found!');
                return;
              }
              if (!this.soundBanner) {
                console.error('❌ soundBanner element not found!');
                return;
              }
              if (!this.enableSoundButton) {
                console.error('❌ enableSoundButton element not found!');
                return;
              }
              
              console.log('✅ DOM elements found and ready');
              // Auto-enable in OBS environment to bypass user gesture policy
              if (this._shouldAutoEnableSound) {
                console.log('🔊 OBS environment detected - auto-enabling sound');
                this.enableSound();
              }
            }
            
            bindUserGestureUnlock() {
              if (this._unlockBound) return;
              const unlock = () => {
                try { this.enableSound(); } catch(_) {}
                window.removeEventListener('pointerdown', unlock);
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
                window.removeEventListener('touchstart', unlock);
              };
              window.addEventListener('pointerdown', unlock, { once: true });
              window.addEventListener('click', unlock, { once: true });
              window.addEventListener('keydown', unlock, { once: true });
              window.addEventListener('touchstart', unlock, { once: true });
              this._unlockBound = true;
            }

            restoreSoundPreference() {
              try {
                const key = 'obs_widget_sound_enabled';
                const val = localStorage.getItem(key);
                if (val === '1') {
                  this.enableSound();
                }
              } catch(_) {}
            }

            init() {
              console.log('🚀 OBSAlertWidget initializing...');
              this.connectWebSocket();
              
              // Set up periodic cleanup of old alerts
              setInterval(() => {
                const now = Date.now();
                const fiveMinutesAgo = now - (5 * 60 * 1000);
                const originalShownCount = this.shownAlerts.size;
                for (const alertId of this.shownAlerts) {
                  if (alertId.includes('-')) {
                    const timestamp = parseInt(alertId.split('-').pop());
                    if (timestamp < fiveMinutesAgo / 1000) {
                      this.shownAlerts.delete(alertId);
                    }
                  }
                }
                
                if (this.shownAlerts.size !== originalShownCount) {
                  console.log('🧹 Cleaned up', originalShownCount - this.shownAlerts.size, 'old shown alerts');
                }
                
                // Log current state for debugging
                console.log('📊 Widget state - Connected:', this.isConnected, 'Shown alerts tracked:', this.shownAlerts.size);
              }, 10000); // Clean up every 10 seconds
            }
            
            connectWebSocket() {
              try {
                // Prevent multiple connections
                if (this.socket && this.socket.connected) {
                  console.log('WebSocket already connected, skipping new connection');
                  return;
                }
                
                // Connect to the OBS widget WebSocket endpoint with alert token
                this.socket = io(this.backendUrl + '/obs-widget', {
                  query: {
                    alertToken: this.alertToken
                  },
                  reconnection: true,
                  reconnectionAttempts: 5,
                  reconnectionDelay: 1000
                });
                
                this.socket.on('connect', () => {
                  console.log('Connected to OBS Widget WebSocket');
                  this.isConnected = true;
                });
                
                this.socket.on('disconnect', () => {
                  console.log('Disconnected from OBS Widget WebSocket');
                  this.isConnected = false;
                });
                
                this.socket.on('joinedStreamerRoom', (data) => {
                  console.log('Joined streamer room:', data.streamerId);
                });
                
                this.socket.on('donationAlert', (alertData) => {
                  console.log('Received donation alert:', alertData);
                  this.showAlert(alertData);
                });
                
                this.socket.on('testAlert', (alertData) => {
                  console.log('Received test alert:', alertData);
                  
                  // If the alert includes settings data, apply them
                  if (alertData.settings) {
                    console.log('🔧 Applying settings from test alert:', alertData.settings);
                    this.applySettings(alertData.settings);
                    
                    // Force a small delay to ensure settings are applied before showing alert
                    setTimeout(() => {
                      this.showAlert(alertData);
                    }, 50);
                  } else {
                    this.showAlert(alertData);
                  }
                });
                
                this.socket.on('connect_error', (error) => {
                  console.error('WebSocket connection error:', error);
                  this.isConnected = false;
                });
                
              } catch (error) {
                console.error('Failed to create OBS Widget WebSocket connection:', error);
                this.isConnected = false;
              }
            }
            
            
            applySettings(newSettings) {
              console.log('🔧 Applying new settings to widget:', newSettings);
              
              // Update the widget's settings
              this.settings = { ...this.settings, ...newSettings };
              
              // Apply visual changes immediately
              const alertContainer = this.alertContainer;
              if (!alertContainer) return;
              
              // Apply style settings
              if (newSettings.styleSettings) {
                const style = newSettings.styleSettings;
                alertContainer.style.fontFamily = style.fontFamily;
                alertContainer.style.backgroundColor = 'transparent';
                alertContainer.style.color = style.textColor;
                alertContainer.style.fontSize = style.fontSize + 'px';
                alertContainer.style.fontWeight = style.fontWeight;
                alertContainer.style.fontStyle = style.fontStyle;
                alertContainer.style.textShadow = style.textShadow ? 
                  style.textShadowOffsetX + 'px ' + style.textShadowOffsetY + 'px ' + style.textShadowBlur + 'px ' + style.textShadowColor : 'none';
                
                // Update border
                alertContainer.style.border = 'none';
                
                // Update font sizes and colors for child elements
                const donorName = document.getElementById('donorName');
                const donorAmount = document.getElementById('donorAmount');
                const donorMessage = document.getElementById('donorMessage');
                const alertTimestamp = document.getElementById('alertTimestamp');
                const donationVerb = document.getElementById('donationVerb');
                
                if (donorName) {
                  donorName.style.fontSize = style.fontSize + 'px';
                  donorName.style.fontWeight = style.fontWeight;
                }
                if (donationVerb) {
                  donationVerb.style.fontSize = style.fontSize + 'px';
                }
                if (donorAmount) {
                  donorAmount.style.fontSize = Math.floor(style.fontSize * 1.3) + 'px';
                  donorAmount.style.color = style.accentColor;
                }
                if (donorMessage) {
                  donorMessage.style.fontSize = style.fontSize + 'px';
                }
                if (alertTimestamp) {
                  alertTimestamp.style.fontSize = Math.floor(style.fontSize * 0.75) + 'px';
                }
              }
              
              // Apply image settings
              if (newSettings.imageSettings) {
                const img = newSettings.imageSettings;
                const media = document.getElementById('alertMedia');
                if (media) {
                  media.style.maxWidth = img.width + 'px';
                  media.style.maxHeight = img.height + 'px';
                  media.style.borderRadius = img.borderRadius + 'px';
                  media.style.boxShadow = img.shadow ? 
                    img.shadowOffsetX + 'px ' + img.shadowOffsetY + 'px ' + img.shadowBlur + 'px ' + img.shadowColor : 'none';
                }
              }
              
              // Apply position settings
              if (newSettings.positionSettings) {
                const pos = newSettings.positionSettings;
                // Reset sides and transform to avoid conflicts
                alertContainer.style.left = '';
                alertContainer.style.right = '';
                alertContainer.style.top = '';
                alertContainer.style.bottom = '';
                alertContainer.style.transform = '';

                const anchor = (pos.anchor || 'top-left');
                const x = typeof pos.x === 'number' ? pos.x : 0;
                const y = typeof pos.y === 'number' ? pos.y : 0;

                // Horizontal
                if (anchor.endsWith('left')) {
                  alertContainer.style.left = x + 'px';
                } else if (anchor.endsWith('center')) {
                  alertContainer.style.left = 'calc(50% + ' + x + 'px)';
                  alertContainer.style.transform += ' translateX(-50%)';
                } else if (anchor.endsWith('right')) {
                  alertContainer.style.right = x + 'px';
                }

                // Vertical
                if (anchor.startsWith('top')) {
                  alertContainer.style.top = y + 'px';
                } else if (anchor.startsWith('middle')) {
                  alertContainer.style.top = 'calc(50% + ' + y + 'px)';
                  alertContainer.style.transform += ' translateY(-50%)';
                } else if (anchor.startsWith('bottom')) {
                  alertContainer.style.bottom = y + 'px';
                }

                if (pos.zIndex !== undefined) {
                  alertContainer.style.zIndex = pos.zIndex;
                }
              }
              
              // Update cooldown and other general settings
              if (newSettings.generalSettings) {
                const general = newSettings.generalSettings;
                this.alertCooldown = general.cooldown;
                console.log('🔧 Updated alert cooldown to:', this.alertCooldown, 'ms');
              }
              
              console.log('✅ Settings applied successfully');
            }
            
            showAlert(alertData) {
              // Check if widget is enabled
              if (this.settings.generalSettings.enabled === false) {
                console.log('🚫 Widget is disabled, skipping alert:', alertData.donorName);
                return;
              }
              
              // Generate alertId if not provided (for test alerts)
              let alertId = alertData.alertId;
              if (!alertId) {
                // Generate a unique ID for test alerts or alerts without ID
                alertId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log('🔧 Generated alertId for alert without ID:', alertId);
              }
              
              console.log('📊 Processing alert:', {
                alertId: alertId,
                donorName: alertData.donorName,
                amount: alertData.amount,
                message: alertData.message,
                imageUrl: alertData.imageUrl,
                audioUrl: alertData.audioUrl,
                timestamp: new Date(alertData.timestamp || Date.now()).toISOString(),
                isTest: alertData.isTest || false
              });
              
              // Debug: Log the full alert data structure
              this.logAlertData(alertData, 'Incoming Alert');
              
              // Store alert data globally for debugging
              window.lastAlertData = alertData;
              console.log('💾 Stored alert data globally as window.lastAlertData for debugging');
              
              // SIMPLE CHECK: Has this alertId been shown before?
              if (this.shownAlerts.has(alertId)) {
                console.log('🚫 Alert already shown before, skipping:', alertData.donorName, 'ID:', alertId);
                return;
              }
              
              // SIMPLE CHECK: Is there a cooldown active?
              const now = Date.now();
              if (now - this.lastAlertTime < this.alertCooldown) {
                console.log('⏱️ Cooldown active, skipping:', alertData.donorName, 'Time since last alert:', now - this.lastAlertTime, 'ms');
                return;
              }
              
              // If we get here, show the alert
              console.log('✅ Alert approved for display:', alertData.donorName, 'ID:', alertId);
              
              // Mark this alert as shown with the alertId
              if (alertId) {
                this.shownAlerts.add(alertId);
                console.log('✅ Marked alert as shown:', alertId);
                console.log('📊 Updated shownAlerts set:', Array.from(this.shownAlerts));
              }
              
              // Update alert content
              document.getElementById('donorName').textContent = alertData.donorName || 'Anonymous';
              document.getElementById('donationVerb').textContent = alertData.donationMessage || 'đã donate';
              document.getElementById('donorAmount').textContent = (alertData.amount ? alertData.amount : '0.00');
              
              // Auto-fit donor amount so currency text is fully visible
              (function fitAmount(){
                try {
                  const el = document.getElementById('donorAmount');
                  const card = document.querySelector('.alert-card') || el?.parentElement;
                  if (!el || !card) return;
                  let size = parseFloat(window.getComputedStyle(el).fontSize) || 18;
                  const maxWidth = (card.clientWidth || 320) - 24;
                  el.style.whiteSpace = 'nowrap';
                  for (let i=0;i<20;i++) {
                    if (el.scrollWidth <= maxWidth || size <= 10) break;
                    size -= 1;
                    el.style.fontSize = size + 'px';
                  }
                } catch (e) { console.warn('fitAmount failed', e); }
              })();

              // Handle alert message - use message from alert data or fallback
              const alertMessage = alertData.message || alertData.donationMessage || 'Thank you for your donation!';
              document.getElementById('donorMessage').textContent = alertMessage;
              
              // Handle alert media image with improved priority and debugging
              console.log('🔍 Image Debug - Processing image for alert:', alertData.donorName);
              console.log('🔍 Image Debug - Available image fields:', {
                imageUrl: !!alertData.imageUrl,
                donorAvatar: !!alertData.donorAvatar,
                url: !!alertData.url,
                image: !!alertData.image,
                avatar: !!alertData.avatar,
                profileImage: !!alertData.profileImage
              });
              
              {
                let imageSource = null;
                let imageSourceType = 'none';

                // Highest priority: level-specific media from alert settings
                if (alertData.settings && alertData.settings.imageSettings && alertData.settings.imageSettings.url) {
                  imageSource = alertData.settings.imageSettings.url;
                  imageSourceType = 'alert.settings.imageSettings.url';
                  console.log('🔍 Using level image from alert settings:', (imageSource || '').substring(0, 100) + ((imageSource||'').length>100?'...':''));
                }

                if (!imageSource && alertData.imageUrl) {
                  imageSource = alertData.imageUrl;
                  imageSourceType = 'imageUrl';
                  console.log('🔍 Using imageUrl field:', imageSource);
                }
                if (!imageSource && alertData.donorAvatar) {
                  imageSource = alertData.donorAvatar;
                  imageSourceType = 'donorAvatar';
                  console.log('🔍 Using donorAvatar field:', imageSource);
                }
                if (!imageSource && alertData.url) {
                  imageSource = alertData.url;
                  imageSourceType = 'url';
                  console.log('🔍 Using url field (image):', imageSource.substring(0, 50) + '...');
                }
                if (!imageSource && alertData.image) {
                  imageSource = alertData.image;
                  imageSourceType = 'image';
                  console.log('🔍 Using image field:', imageSource);
                }
                if (!imageSource && alertData.avatar) {
                  imageSource = alertData.avatar;
                  imageSourceType = 'avatar';
                  console.log('🔍 Using avatar field:', imageSource);
                }
                if (!imageSource && alertData.profileImage) {
                  imageSource = alertData.profileImage;
                  imageSourceType = 'profileImage';
                  console.log('🔍 Using profileImage field:', imageSource);
                }

                // Fallback: use configured image from settings if available
                if (!imageSource && this.settings?.imageSettings?.url) {
                  imageSource = this.settings.imageSettings.url;
                  imageSourceType = 'settings.imageSettings.url';
                  console.log('🔍 Using configured image from settings:', imageSource);
                }

                if (!imageSource) {
                  console.log('⚠️ No suitable image source found, skipping image display');
                }

                if (imageSource && this.isValidImageSource(imageSource)) {
                  this.alertMedia.src = imageSource;
                  this.alertMedia.style.display = 'block';
                  console.log('✅ Image set successfully from', imageSourceType, 'field');
                } else {
                  this.alertMedia.style.display = 'none';
                }
              }
              
              const timestamp = new Date(alertData.timestamp || Date.now());
              document.getElementById('alertTimestamp').textContent = timestamp.toLocaleTimeString();
              
              // Play audio if provided and enabled
              console.log('🔍 Audio Debug - Sound settings enabled:', this.settings.soundSettings.enabled);
              console.log('🔍 Audio Debug - alertData.url exists:', !!alertData.url);
              if (alertData.url) {
                console.log('🔍 Audio Debug - url starts with data:audio/:', alertData.url.startsWith('data:audio/'));
                console.log('🔍 Audio Debug - url type:', alertData.url.substring(0, 20));
              }
              
              if (this.settings.soundSettings.enabled && alertData.audioUrl) {
                console.log('Playing alert audio:', alertData.audioUrl);
                this.playAudio(alertData.audioUrl);
              } else if (this.settings.soundSettings.enabled && alertData.soundUrl) {
                console.log('Playing alert sound from soundUrl field:', alertData.soundUrl);
                this.playAudio(alertData.soundUrl);
              } else if (this.settings.soundSettings.enabled && alertData.url && alertData.url.startsWith('data:audio/')) {
                console.log('Playing alert audio from url field (audio):', alertData.url.substring(0, 50) + '...');
                this.playAudio(alertData.url);
              } else if (this.settings.soundSettings.enabled && this.settings?.soundSettings?.url) {
                console.log('Playing configured sound from settings:', this.settings.soundSettings.url);
                this.playAudio(this.settings.soundSettings.url);
              } else if (this.settings.soundSettings.enabled) {
                console.log('No audio provided, playing default beep');
                this.playDefaultBeep();
              } else {
                console.log('Audio is disabled in settings');
              }
              
              // Show alert with fadeInOut animation
              this.alertContainer.style.display = 'block';
              this.alertContainer.style.animation = 'fadeInOut ' + (this.settings.displaySettings.duration || 5000) + 'ms ease-in-out';
              
              console.log('🎬 ALERT NOW VISIBLE ON SCREEN:', alertData.donorName, 'ID:', alertId);
              console.log('🎬 Display timestamp:', new Date().toISOString());
              console.log('🎬 Time since last alert:', Date.now() - this.lastAlertTime, 'ms');
              console.log('🎬 Message displayed:', alertMessage);
              console.log('🎬 Image displayed:', alertData.imageUrl || alertData.donorAvatar || (alertData.url && alertData.url.startsWith('data:image/') ? 'from url field' : 'default'));
              console.log('🎬 Audio played:', alertData.audioUrl || alertData.soundUrl || (alertData.url && alertData.url.startsWith('data:audio/') ? 'from url field' : 'none'));
              
              // Update last alert time for cooldown
              this.lastAlertTime = Date.now();
              
              // Hide after animation duration
              setTimeout(() => {
                this.alertContainer.style.display = 'none';
              }, this.settings.displaySettings.duration || 5000);
            }
            
            showSoundBanner(pendingUrl) {
              this.pendingAudioUrl = pendingUrl || null;
              const banner = document.getElementById('soundBanner');
              const btn = document.getElementById('enableSoundButton');
              if (!banner || !btn) return;
              banner.style.display = 'block';
              if (!this._soundClickBound) {
                btn.addEventListener('click', () => this.enableSound());
                this._soundClickBound = true;
              }
            }

            enableSound() {
              try {
                // Attempt to unlock WebAudio for future beeps
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx && !this._audioCtxTested) {
                  const ctx = new AudioCtx();
                  if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => {});
                  }
                  // Close immediately; we'll recreate when needed
                  setTimeout(() => { try { ctx.close(); } catch(_) {} }, 0);
                  this._audioCtxTested = true;
                }
              } catch(_) {}
              this.audioEnabled = true;
              try { localStorage.setItem('obs_widget_sound_enabled', '1'); } catch(_) {}
              const banner = document.getElementById('soundBanner');
              if (banner) banner.style.display = 'none';
              if (this.pendingAudioUrl) {
                const url = this.pendingAudioUrl;
                this.pendingAudioUrl = null;
                setTimeout(() => this.playAudio(url), 0);
              }
            }

            // Helper method to play audio
            playAudio(audioUrl) {
              try {
                if (!audioUrl) {
                  console.log('🔊 No audio URL provided');
                  return;
                }
                
                console.log('🔊 Creating audio element for:', audioUrl);
                const audio = new Audio(audioUrl);
                audio.setAttribute('playsinline', '');
                audio.setAttribute('preload', 'auto');
                
                // Apply sound settings
                audio.volume = (this.settings.soundSettings.volume || 80) / 100;
                
                // Handle fade in/out if enabled
                if (this.settings.soundSettings.fadeIn > 0) {
                  audio.volume = 0;
                  const fadeInInterval = setInterval(() => {
                    if (audio.volume < (this.settings.soundSettings.volume || 80) / 100) {
                      audio.volume += 0.1;
                    } else {
                      clearInterval(fadeInInterval);
                    }
                  }, this.settings.soundSettings.fadeIn / 10);
                }
                
                // Set loop if enabled
                audio.loop = this.settings.soundSettings.loop || false;
                
                // Try to play the audio (autoplay-safe strategy)
                audio.play().then(() => {
                  console.log('🔊 Audio started playing successfully');
                }).catch((error) => {
                  console.warn('🔇 Autoplay blocked, attempting muted autoplay fallback:', error?.name || error);
                  // Try muted autoplay, then unmute shortly after start
                  audio.muted = true;
                  audio.play().then(() => {
                    setTimeout(() => { audio.muted = false; }, 50);
                    console.log('🔊 Muted autoplay succeeded, unmuted audio');
                  }).catch((err2) => {
                    console.error('🔊 Muted autoplay also failed:', err2?.name || err2);
                    // Show enable sound banner and retry when enabled
                    this.showSoundBanner(audioUrl);
                    // Final fallback: play short beep
                    this.playDefaultBeep();
                  });
                });
                
                // Handle fade out if enabled
                if (this.settings.soundSettings.fadeOut > 0) {
                  const fadeOutStart = (this.settings.displaySettings.duration || 5000) - this.settings.soundSettings.fadeOut;
                  setTimeout(() => {
                    const fadeOutInterval = setInterval(() => {
                      if (audio.volume > 0) {
                        audio.volume -= 0.1;
                      } else {
                        clearInterval(fadeOutInterval);
                        audio.pause();
                      }
                    }, this.settings.soundSettings.fadeOut / 10);
                  }, fadeOutStart);
                } else {
                  // Stop audio when alert duration ends
                  setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                  }, this.settings.displaySettings.duration || 5000);
                }
                
              } catch (error) {
                console.error('🔊 Error playing audio:', error);
              }
            }
            
            playDefaultBeep() {
              try {
                if (!this.audioEnabled) return; // avoid WebAudio policy errors before user gesture
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const targetVolume = (this.settings.soundSettings.volume || 80) / 100;
                osc.type = 'sine';
                osc.frequency.value = 880;
                gain.gain.value = targetVolume * 0.3;
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                const stopAfter = Math.min((this.settings.displaySettings.duration || 500), 800);
                setTimeout(() => {
                  osc.stop();
                  ctx.close();
                }, stopAfter);
              } catch (e) {
                console.error('🔊 Error playing default beep:', e);
              }
            }
            
            resetDuplicateTracking() {
              console.log('🔄 Resetting duplicate alert tracking');
              this.shownAlerts.clear();
              this.lastAlertTime = 0; // Reset cooldown
            }
            
            resetCooldown() {
              console.log('⏱️ Resetting alert cooldown');
              this.lastAlertTime = 0;
            }
            
            // Debug method to check if a specific alertId is being tracked
            isAlertIdTracked(alertId) {
              const isShown = this.shownAlerts.has(alertId);
              
              return {
                alertId,
                isShown,
                shownAlertsCount: this.shownAlerts.size,
                shownAlerts: Array.from(this.shownAlerts)
              };
            }
            
            // Simple test method to verify widget is working
            test() {
              console.log('🧪 Widget test method called');
              console.log('🧪 Current state:', {
                isConnected: this.isConnected,
                shownAlertsCount: this.shownAlerts.size
              });
              return 'Widget is working!';
            }
            
            // Debug method to show current state
            getDebugInfo() {
              const now = Date.now();
              const timeSinceLastAlert = now - this.lastAlertTime;
              const cooldownRemaining = Math.max(0, this.alertCooldown - timeSinceLastAlert);
              
              return {
                shownAlertsCount: this.shownAlerts.size,
                shownAlertIds: Array.from(this.shownAlerts),
                isConnected: this.isConnected,
                settings: {
                  displayDuration: this.settings.displaySettings.duration,
                  alertCooldown: this.alertCooldown,
                  priority: this.settings.generalSettings.priority,
                  enabled: this.settings.generalSettings.enabled
                },
                cooldown: {
                  lastAlertTime: this.lastAlertTime,
                  timeSinceLastAlert: timeSinceLastAlert,
                  cooldownRemaining: cooldownRemaining,
                  isActive: cooldownRemaining > 0
                }
              };
            }
            
            // Debug method to check sound settings
            getSoundSettings() {
              return {
                soundEnabled: this.settings.soundSettings.enabled,
                volume: this.settings.soundSettings.volume,
                fadeIn: this.settings.soundSettings.fadeIn,
                fadeOut: this.settings.soundSettings.fadeOut,
                loop: this.settings.soundSettings.loop,
                rawSettings: this.settings.soundSettings
              };
            }
            
            // Debug method to test URL field detection
            testUrlField(url) {
              if (!url) {
                return { exists: false, type: 'none', message: 'No URL provided' };
              }
              
              const result = {
                exists: true,
                length: url.length,
                startsWith: url.substring(0, 30),
                isImage: url.startsWith('data:image/'),
                isAudio: url.startsWith('data:audio/'),
                hasBase64: url.includes('base64'),
                type: 'unknown'
              };
              
              if (result.isImage) {
                result.type = 'image';
                result.message = 'URL contains image data';
              } else if (result.isAudio) {
                result.type = 'audio';
                result.message = 'URL contains audio data';
              } else if (url.startsWith('http')) {
                result.type = 'external';
                result.message = 'URL is external link';
              } else {
                result.type = 'other';
                result.message = 'URL contains other data';
              }
              
              return result;
            }
            
            // Debug method to test image handling with specific alert data
            testImageHandling(alertData) {
              console.log('🧪 Testing image handling with alert data:', alertData.donorName);
              
              const imageFields = ['imageUrl', 'donorAvatar', 'url', 'image', 'avatar', 'profileImage'];
              const results = {};
              
              imageFields.forEach(field => {
                if (alertData[field]) {
                  results[field] = {
                    exists: true,
                    value: alertData[field],
                    isImage: this.isImageUrl(alertData[field]),
                    isValid: this.isValidImageSource(alertData[field]),
                    type: this.getImageType(alertData[field])
                  };
                } else {
                  results[field] = {
                    exists: false,
                    value: null,
                    isImage: false,
                    isValid: false,
                    type: 'none'
                  };
                }
              });
              
              // Determine which field would be used
              let selectedField = 'none';
              let selectedValue = null;
              
              if (alertData.imageUrl) {
                selectedField = 'imageUrl';
                selectedValue = alertData.imageUrl;
              } else if (alertData.donorAvatar) {
                selectedField = 'donorAvatar';
                selectedValue = alertData.donorAvatar;
              } else if (alertData.url && this.isImageUrl(alertData.url)) {
                selectedField = 'url';
                selectedValue = alertData.url;
              } else if (alertData.image) {
                selectedField = 'image';
                selectedValue = alertData.image;
              } else if (alertData.avatar) {
                selectedField = 'avatar';
                selectedValue = alertData.avatar;
              } else if (alertData.profileImage) {
                selectedField = 'profileImage';
                selectedValue = alertData.profileImage;
              }
              
              return {
                fieldAnalysis: results,
                selectedField: selectedField,
                selectedValue: selectedValue,
                willUseDefault: selectedField === 'none',
                recommendation: this.getImageRecommendation(results, selectedField)
              };
            }
            
            // Debug method to log full alert data structure
            logAlertData(alertData, label) {
              console.log(label + ' - Full Structure:');
              console.log('Raw alertData:', alertData);
              console.log('alertData keys:', Object.keys(alertData));
              console.log('alertData values:', Object.values(alertData));
              
              // Log specific fields that might contain media
              const mediaFields = ['imageUrl', 'audioUrl', 'soundUrl', 'donorAvatar', 'image', 'audio', 'sound'];
              console.log('Media fields check:');
              mediaFields.forEach(function(field) {
                if (alertData[field]) {
                  console.log('[OK] ' + field + ':', alertData[field]);
                } else {
                  console.log('[MISSING] ' + field + ': undefined/null');
                }
              });
              
              // Check the 'url' field for media content
              if (alertData.url) {
                console.log('[OK] url field found:', alertData.url.substring(0, 100) + '...');
                if (alertData.url.startsWith('data:image/')) {
                  console.log('[OK] url contains image data (base64)');
                } else if (alertData.url.startsWith('data:audio/')) {
                  console.log('[OK] url contains audio data (base64)');
                } else if (alertData.url.startsWith('http')) {
                  console.log('[OK] url contains external link');
                } else {
                  console.log('[INFO] url contains other data type');
                }
              } else {
                console.log('[MISSING] url field: undefined/null');
              }
              
              // Log message fields
              const messageFields = ['message', 'donationMessage', 'text', 'content'];
              console.log('Message fields check:');
              messageFields.forEach(function(field) {
                if (alertData[field]) {
                  console.log('[OK] ' + field + ':', alertData[field]);
                } else {
                  console.log('[MISSING] ' + field + ': undefined/null');
                }
              });
              
              // Log donor info fields
              const donorFields = ['donorName', 'name', 'username', 'amount', 'donationAmount'];
              console.log('Donor fields check:');
              donorFields.forEach(function(field) {
                if (alertData[field]) {
                  console.log('[OK] ' + field + ':', alertData[field]);
                } else {
                  console.log('[MISSING] ' + field + ': undefined/null');
                }
              });
            }
            
            destroy() {
              console.log('🗑️ Destroying widget');
              this.shownAlerts.clear();
              
              if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
              }
              
              this.isConnected = false;
            }
            
            // Helper method to check if URL contains image data
            isImageUrl(url) {
              if (!url) return false;
              
              // Check for data URLs
              if (url.startsWith('data:image/')) return true;
              
              // Check for common image file extensions
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
              const lowerUrl = url.toLowerCase();
              return imageExtensions.some(ext => lowerUrl.includes(ext));
            }
            
            // Helper method to validate image source
            isValidImageSource(source) {
              if (!source) return false;
              
              // Check for data URLs
              if (source.startsWith('data:image/')) return true;
              
              // Check for HTTP/HTTPS URLs
              if (source.startsWith('http://') || source.startsWith('https://')) return true;
              
              // Check for relative URLs
              if (source.startsWith('/') || source.startsWith('./') || source.startsWith('../')) return true;
              
              // Check for common image file extensions
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
              const lowerSource = source.toLowerCase();
              return imageExtensions.some(ext => lowerSource.includes(ext));
            }
            
            // Helper method to get default avatar
            getDefaultAvatar() {
              return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiM2NjY2NjYiLz4KPHN2ZyB4PSIxMi41IiB5PSIxMi41IiB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNSAyNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjEyLjUiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=';
            }
            
            // Helper method to get image type
            getImageType(source) {
              if (!source) return 'none';
              if (source.startsWith('data:image/')) return 'data-url';
              if (source.startsWith('http://') || source.startsWith('https://')) return 'external-url';
              if (source.startsWith('/') || source.startsWith('./') || source.startsWith('../')) return 'relative-url';
              
              const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
              const lowerSource = source.toLowerCase();
              for (const ext of imageExtensions) {
                if (lowerSource.includes(ext)) return 'file-extension';
              }
              
              return 'unknown';
            }
            
            // Helper method to get image recommendation
            getImageRecommendation(results, selectedField) {
              if (selectedField === 'none') {
                return 'No valid image source found. Consider adding imageUrl or donorAvatar field.';
              }
              
              const selected = results[selectedField];
              if (!selected.isValid) {
                return 'Selected field \\'' + selectedField + '\\' contains invalid image data. Check the format.';
              }
              
              return 'Using \\'' + selectedField + '\\' field. Image should display correctly.';
            }

            isOBSEnvironment() {
              try {
                if (window.obsstudio) return true;
                const ua = (navigator.userAgent || '').toLowerCase();
                return ua.includes('obs') || ua.includes('streamlabs') || ua.includes('xsplit');
              } catch (_) { return false; }
            }
            
            hasForceAutoplayFlag() {
              try {
                const params = new URLSearchParams(window.location.search || '');
                const val = (params.get('autoplay') || '').toLowerCase();
                return val === '1' || val === 'true' || val === 'yes' || val === 'force';
              } catch (_) { return false; }
            }
          }
          
          // Initialize widget when page loads
          document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM Content Loaded - Creating widget...');
            const widget = new OBSAlertWidget('${alertToken}', '${baseUrl}', {
              imageSettings: ${JSON.stringify(imageSettings)},
              soundSettings: ${JSON.stringify(soundSettings)},
              styleSettings: ${JSON.stringify(styleSettings)},
              positionSettings: ${JSON.stringify(positionSettings)},
              displaySettings: ${JSON.stringify(displaySettings)},
              generalSettings: ${JSON.stringify(generalSettings)}
            });
            
            // Expose debug methods on window for testing
            window.widgetDebug = {
              resetTracking: () => widget.resetDuplicateTracking(),
              resetCooldown: () => widget.resetCooldown(),
              getInfo: () => widget.getDebugInfo(),
              isAlertIdTracked: (id) => widget.isAlertIdTracked(id),
              test: () => widget.test(),
              logAlertData: (data, label) => widget.logAlertData(data, label),
              getSoundSettings: () => widget.getSoundSettings(),
              testUrlField: (url) => widget.testUrlField(url),
              testImageHandling: (data) => widget.testImageHandling(data)
            };
            
            // Clean up widget when page is unloaded
            window.addEventListener('beforeunload', () => {
              widget.destroy();
            });
          });
        </script>
      </body>
      </html>
    `;
    }
};
exports.WidgetController = WidgetController;
__decorate([
    (0, common_1.Get)('streamer-:streamerId/:alertToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS widget HTML/JS with streamer ID in URL (Public endpoint for OBS Browser Source)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS widget HTML/JS served successfully',
        content: {
            'text/html': {
                schema: {
                    type: 'string',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Param)('alertToken')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WidgetController.prototype, "getWidgetWithStreamerId", null);
__decorate([
    (0, common_1.Get)('alert/:streamerId/:alertToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS widget HTML/JS with streamer ID and alert token (Public endpoint for OBS Browser Source)' }),
    (0, swagger_1.ApiParam)({ name: 'streamerId', description: 'Streamer user ID' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS widget HTML/JS served successfully',
        content: {
            'text/html': {
                schema: {
                    type: 'string',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found or invalid token' }),
    __param(0, (0, common_1.Param)('streamerId')),
    __param(1, (0, common_1.Param)('alertToken')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WidgetController.prototype, "serveWidget", null);
__decorate([
    (0, common_1.Get)('alert/:alertToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get OBS widget HTML/JS (Public endpoint for OBS Browser Source)' }),
    (0, swagger_1.ApiParam)({ name: 'alertToken', description: 'Alert token for OBS widget' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OBS widget HTML/JS served successfully',
        content: {
            'text/html': {
                schema: {
                    type: 'string',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'OBS settings not found' }),
    __param(0, (0, common_1.Param)('alertToken')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WidgetController.prototype, "getWidget", null);
exports.WidgetController = WidgetController = __decorate([
    (0, swagger_1.ApiTags)('OBS Widget (Public)'),
    (0, common_1.Controller)('widget-public'),
    __metadata("design:paramtypes", [obs_settings_service_1.OBSSettingsService])
], WidgetController);
//# sourceMappingURL=widget.controller.js.map
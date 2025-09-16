# OBS Integration Guide for Donation Alerts

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Your Widget URL](#getting-your-widget-url)
4. [Setting Up OBS Browser Source](#setting-up-obs-browser-source)
5. [Customization Options](#customization-options)
6. [Testing Your Alerts](#testing-your-alerts)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)
9. [Advanced Configuration](#advanced-configuration)
10. [FAQ](#faq)

## Overview

This guide will help you integrate donation alerts into your OBS stream using our widget system. The widget displays real-time alerts when viewers make donations, with customizable animations, sounds, and styling.

### Features
- **Real-time alerts** via WebSocket connection
- **Customizable animations** (fade, slide, bounce, zoom)
- **Sound effects** with volume control
- **Queue system** for multiple consecutive alerts
- **Responsive design** for different canvas sizes
- **Secure token-based authentication**

## Prerequisites

Before setting up your OBS widget, ensure you have:

1. **OBS Studio** installed (version 28.0 or later recommended)
2. **Active streamer account** on our platform
3. **OBS settings configured** in your dashboard
4. **Stable internet connection** for WebSocket communication

## Getting Your Widget URL

### Step 1: Access Your Dashboard
1. Log into your streamer dashboard
2. Navigate to **Settings** → **OBS Integration**
3. Locate your **Widget URL** section

### Step 2: Copy Your Widget URL
Your widget URL will look like this:
```
https://yourdomain.com/obs-settings/widget/abc123def4567890...
```

**Important**: Keep this URL private and never share it publicly!

### Step 3: Regenerate Token (Optional)
If you need to regenerate your widget token:
1. Click **"Regenerate Token"** in your dashboard
2. Copy the new widget URL
3. Update your OBS Browser Source with the new URL

## Setting Up OBS Browser Source

### Step 1: Add Browser Source
1. Open OBS Studio
2. In the **Sources** panel, click the **+** button
3. Select **"Browser"** from the menu
4. Name it "Donation Alerts" and click **OK**

### Step 2: Configure Browser Source
1. **URL**: Paste your widget URL from the dashboard
2. **Width**: Set to `1920` (or your canvas width)
3. **Height**: Set to `1080` (or your canvas height)
4. **CSS**: Leave blank (widget handles its own styling)

### Step 3: Advanced Settings
1. Check **"Shutdown source when not visible"** for better performance
2. Check **"Refresh browser when scene becomes active"** for reliability
3. Set **"Custom FPS"** to `30` for smooth animations

### Step 4: Position and Size
1. Position the browser source where you want alerts to appear
2. Resize as needed (widget is responsive)
3. Ensure it's above other sources in the layer order

## Customization Options

### URL Parameters
You can customize the widget by adding parameters to your widget URL:

```
https://yourdomain.com/obs-settings/widget/your-token?theme=dark&animation=slide&sound=off
```

#### Available Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `theme` | `light`, `dark`, `custom` | `dark` | Widget theme |
| `animation` | `fade`, `slide`, `bounce`, `zoom` | `fade` | Alert animation |
| `sound` | `on`, `off` | `on` | Sound effects |
| `volume` | `0-100` | `50` | Sound volume |
| `duration` | `3000-10000` | `5000` | Alert display duration (ms) |
| `position` | `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center` | `top-right` | Alert position |
| `font-size` | `12-48` | `24` | Font size (px) |
| `max-width` | `200-800` | `400` | Maximum alert width (px) |

### Example URLs

**Dark theme with slide animation:**
```
https://yourdomain.com/obs-settings/widget/your-token?theme=dark&animation=slide
```

**Light theme with bounce animation and no sound:**
```
https://yourdomain.com/obs-settings/widget/your-token?theme=light&animation=bounce&sound=off
```

**Custom duration and position:**
```
https://yourdomain.com/obs-settings/widget/your-token?duration=7000&position=center
```

## Testing Your Alerts

### Method 1: Dashboard Test
1. Go to your dashboard → **OBS Integration**
2. Click **"Test Alert"** button
3. Watch for the alert in your OBS preview/stream

### Method 2: API Testing
Use our test endpoint to trigger alerts:

```bash
curl -X POST https://yourdomain.com/obs-settings/widget/your-token/alert \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Test Donor",
    "amount": "25.00",
    "currency": "USD",
    "message": "Test donation alert!"
  }'
```

### Method 3: Browser Testing
1. Open your widget URL in a browser
2. Open browser developer tools (F12)
3. In the console, run:
```javascript
// Test alert
fetch('/obs-settings/widget/your-token/alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    donorName: 'Test Donor',
    amount: '25.00',
    currency: 'USD',
    message: 'Test alert!'
  })
});
```

## Troubleshooting

### Common Issues

#### Widget Not Loading
**Symptoms**: Browser source shows blank or error page
**Solutions**:
1. Check your widget URL is correct
2. Verify your token is valid and not expired
3. Try refreshing the browser source
4. Check internet connection

#### Alerts Not Appearing
**Symptoms**: Widget loads but no alerts show
**Solutions**:
1. Check WebSocket connection status (green indicator)
2. Verify alerts are being triggered
3. Check browser source is visible and not covered
4. Try regenerating your widget token

#### Sound Not Playing
**Symptoms**: Visual alerts work but no sound
**Solutions**:
1. Check `sound=on` parameter in URL
2. Verify system audio is not muted
3. Check OBS audio settings
4. Try different volume levels

#### Performance Issues
**Symptoms**: Laggy animations or delayed alerts
**Solutions**:
1. Reduce canvas resolution
2. Lower custom FPS setting
3. Check internet connection speed
4. Close unnecessary browser tabs

### Connection Status Indicators

The widget shows connection status in the top-right corner:
- 🟢 **Green**: Connected and ready
- 🟡 **Yellow**: Connecting...
- 🔴 **Red**: Disconnected
- ⚫ **Gray**: Error

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid token" | Token is invalid or expired | Regenerate token in dashboard |
| "Connection failed" | WebSocket connection failed | Check internet and try again |
| "Widget not found" | Token doesn't exist | Verify token in dashboard |
| "Rate limited" | Too many requests | Wait 1 minute and try again |

## Security Best Practices

### Keep Your Token Secure
- **Never share** your widget URL publicly
- **Don't post** it on social media or forums
- **Use private** browser windows when testing
- **Regenerate** token if accidentally exposed

### Network Security
- Use **HTTPS** connections only
- Avoid **public WiFi** for testing
- Consider **VPN** for additional security
- Monitor **connection logs** in dashboard

### Token Management
- **Regular rotation**: Regenerate tokens monthly
- **Monitor usage**: Check dashboard for unusual activity
- **Revoke immediately** if compromised
- **Use unique tokens** for different streams

### OBS Security
- **Don't record** your dashboard with token visible
- **Use scene collections** to separate test/stream setups
- **Check recordings** before uploading
- **Secure your OBS** with password protection

## Advanced Configuration

### Multiple Alert Queues
The widget automatically queues multiple alerts:
- **Queue limit**: 10 alerts maximum
- **Display time**: 5 seconds per alert (customizable)
- **Fade transition**: 500ms between alerts

### Custom CSS Styling
You can add custom CSS via URL parameters:

```
https://yourdomain.com/obs-settings/widget/your-token?custom-css=background:red;color:white;
```

### WebSocket Configuration
Advanced WebSocket settings:
- **Reconnection**: Automatic with exponential backoff
- **Heartbeat**: 30-second intervals
- **Timeout**: 10 seconds for operations
- **Max retries**: 5 attempts

### Performance Optimization
For better performance:
1. **Lower resolution**: Use 720p instead of 1080p
2. **Reduce FPS**: Set to 24 or 30 FPS
3. **Limit animations**: Use simpler animations
4. **Disable sound**: If not needed

## FAQ

### Q: Can I use multiple widgets for different alert types?
A: Yes, you can create multiple browser sources with different customization parameters.

### Q: What happens if my internet connection drops?
A: The widget will automatically reconnect when connection is restored.

### Q: Can I customize the alert sound?
A: Currently, the widget uses built-in sounds. Custom sounds are planned for future updates.

### Q: How do I change alert colors?
A: Use the `theme` parameter or add custom CSS via URL parameters.

### Q: Can I test alerts without going live?
A: Yes, use the test functions in your dashboard or the API endpoints.

### Q: What's the maximum donation amount the widget can display?
A: The widget can display any amount, but very large numbers may need custom CSS for proper formatting.

### Q: Can I use this with other streaming software?
A: The widget works with any software that supports browser sources (Streamlabs, XSplit, etc.).

### Q: How do I update the widget when I make changes?
A: Refresh the browser source in OBS or restart OBS to pick up changes.

## Support

If you need help with OBS integration:

1. **Check this guide** for common solutions
2. **Review troubleshooting** section above
3. **Contact support** with specific error messages
4. **Include screenshots** of any issues
5. **Provide logs** from browser developer tools

### Useful Links
- [OBS Studio Download](https://obsproject.com/)
- [OBS Browser Source Documentation](https://obsproject.com/wiki/Sources-Guide#browser-source)
- [WebSocket Testing Tools](https://websocket.org/echo.html)
- [Our API Documentation](https://yourdomain.com/api/docs)

---

**Last Updated**: August 12, 2025  
**Version**: 1.0.0 
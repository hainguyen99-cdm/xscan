# OBS Integration Troubleshooting Guide

## Quick Diagnosis

### Connection Status Check
Look for the connection indicator in your widget:
- 🟢 **Green**: Connected and working
- 🟡 **Yellow**: Connecting...
- 🔴 **Red**: Disconnected
- ⚫ **Gray**: Error

## Common Issues & Solutions

### 1. Widget Not Loading

**Symptoms:**
- Browser source shows blank page
- Error message in browser source
- "Page not found" error

**Solutions:**

#### Check Widget URL
1. Verify URL format: `https://yourdomain.com/obs-settings/widget/your-token`
2. Ensure no extra spaces or characters
3. Check if token is 64 characters long (hex format)

#### Verify Token
1. Go to your dashboard → OBS Integration
2. Check if token is active and not expired
3. Try regenerating the token
4. Copy the new URL to OBS

#### Network Issues
1. Check internet connection
2. Try accessing widget URL in regular browser
3. Check if your domain is accessible
4. Try from different network (mobile hotspot)

### 2. Alerts Not Appearing

**Symptoms:**
- Widget loads but no alerts show
- Connection indicator is red
- Test alerts don't work

**Solutions:**

#### Check WebSocket Connection
1. Look for green connection indicator
2. If red, refresh browser source
3. Check browser console for errors (F12)
4. Verify WebSocket endpoint is accessible

#### Verify Alert Triggering
1. Use dashboard test button
2. Check API endpoint: `POST /obs-settings/widget/your-token/alert`
3. Verify donation webhooks are working
4. Check server logs for errors

#### Browser Source Settings
1. Ensure browser source is visible
2. Check layer order (should be above other sources)
3. Verify dimensions are correct
4. Try refreshing browser source

### 3. Sound Not Playing

**Symptoms:**
- Visual alerts work but no sound
- Sound plays in browser but not OBS
- Volume controls don't work

**Solutions:**

#### OBS Audio Settings
1. Check "Capture audio" in browser source properties
2. Verify system audio is not muted
3. Check OBS audio mixer levels
4. Ensure browser source audio is enabled

#### Widget Sound Settings
1. Add `?sound=on` to widget URL
2. Check volume parameter: `?volume=50`
3. Verify browser allows autoplay
4. Test sound in regular browser first

#### System Audio
1. Check Windows/Mac audio settings
2. Verify default audio device
3. Test with different audio outputs
4. Restart OBS and try again

### 4. Performance Issues

**Symptoms:**
- Laggy animations
- Delayed alerts
- High CPU usage
- Browser source crashes

**Solutions:**

#### OBS Performance
1. Lower canvas resolution (720p instead of 1080p)
2. Reduce custom FPS to 24 or 30
3. Check "Shutdown source when not visible"
4. Close unnecessary browser tabs

#### Widget Optimization
1. Use simpler animations (`?animation=fade`)
2. Disable sound if not needed (`?sound=off`)
3. Reduce alert duration (`?duration=3000`)
4. Use smaller font size (`?font-size=18`)

#### System Resources
1. Close other applications
2. Check available RAM
3. Monitor CPU usage
4. Update graphics drivers

### 5. Security Issues

**Symptoms:**
- "Invalid token" errors
- "Rate limited" messages
- Unauthorized access attempts
- Token exposure warnings

**Solutions:**

#### Token Security
1. Regenerate token immediately if exposed
2. Check dashboard for security violations
3. Review connection logs
4. Enable IP restrictions if needed

#### Rate Limiting
1. Wait 1 minute between requests
2. Check for multiple browser sources
3. Verify no duplicate connections
4. Contact support if persistent

#### Access Control
1. Use HTTPS connections only
2. Avoid public WiFi for testing
3. Monitor dashboard for unusual activity
4. Enable security features in dashboard

## Advanced Troubleshooting

### Browser Console Debugging

1. Open widget URL in regular browser
2. Press F12 to open developer tools
3. Check Console tab for errors
4. Look for WebSocket connection messages
5. Check Network tab for failed requests

### Common Console Errors

```
WebSocket connection failed
```
**Solution**: Check internet connection and server status

```
Invalid token format
```
**Solution**: Regenerate token in dashboard

```
Rate limit exceeded
```
**Solution**: Wait 1 minute and try again

```
CORS error
```
**Solution**: Use HTTPS URL and check server CORS settings

### Network Diagnostics

#### Test WebSocket Connection
```javascript
// In browser console
const ws = new WebSocket('wss://yourdomain.com/obs-widget');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.log('Error:', e);
```

#### Test API Endpoint
```bash
curl -X POST https://yourdomain.com/obs-settings/widget/your-token/alert \
  -H "Content-Type: application/json" \
  -d '{"donorName":"Test","amount":"10.00","currency":"USD"}'
```

### Server-Side Debugging

#### Check Server Logs
1. Look for WebSocket connection logs
2. Check for authentication errors
3. Monitor rate limiting events
4. Review security violation logs

#### Verify Endpoints
1. Test widget endpoint: `GET /obs-settings/widget/:token`
2. Test alert endpoint: `POST /obs-settings/widget/:token/alert`
3. Test token validation: `GET /obs-settings/token/:token`
4. Check WebSocket namespace: `/obs-widget`

## Performance Optimization

### OBS Settings
- **Canvas Resolution**: 1920x1080 or lower
- **Output Resolution**: Match canvas
- **FPS**: 30 or lower
- **Browser Source FPS**: 30
- **Shutdown when not visible**: Enabled
- **Refresh when scene active**: Enabled

### Widget Settings
- **Animation**: Use `fade` for best performance
- **Duration**: 3000-5000ms
- **Sound**: Disable if not needed
- **Font Size**: 18-24px
- **Max Width**: 400px

### System Optimization
- **Close unnecessary applications**
- **Update graphics drivers**
- **Use wired internet connection**
- **Monitor system resources**
- **Restart OBS regularly**

## Getting Help

### Before Contacting Support

1. **Check this troubleshooting guide**
2. **Test with different browser**
3. **Try regenerating token**
4. **Check system requirements**
5. **Review recent changes**

### Information to Provide

When contacting support, include:
- **Error messages** (screenshots)
- **Widget URL** (keep private)
- **OBS version** and settings
- **System specifications**
- **Steps to reproduce issue**
- **Console logs** (if available)

### Support Channels

- **Email**: support@yourdomain.com
- **Discord**: [Your Discord Server]
- **Documentation**: [Link to full guide]
- **Video Tutorial**: [Link to tutorial]

## Prevention Tips

### Regular Maintenance
1. **Update OBS Studio** regularly
2. **Regenerate tokens** monthly
3. **Monitor dashboard** for issues
4. **Test alerts** before each stream
5. **Backup settings** and configurations

### Best Practices
1. **Keep widget URL private**
2. **Use HTTPS connections**
3. **Monitor connection status**
4. **Test in preview mode first**
5. **Have backup alert system**

---

**Last Updated**: August 12, 2025  
**Version**: 1.0.0 
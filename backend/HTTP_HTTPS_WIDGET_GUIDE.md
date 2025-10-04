# HTTP vs HTTPS Widget Guide

## Problem
The XScan server is configured to run on **HTTP only** in development mode, but browsers may try to access widgets via HTTPS, causing SSL/TLS protocol errors.

## Error Messages
- `net::ERR_SSL_PROTOCOL_ERROR`
- `Server does not support https, please change to use http`

## Solution

### For OBS Browser Source
Use the **HTTP URL** instead of HTTPS:

```
❌ WRONG (HTTPS - will cause errors):
https://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e

✅ CORRECT (HTTP - will work with real-time updates):
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e

✅ ALTERNATIVE (Static mode - no WebSocket, no SSL issues):
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e?static=true
```

### For Browser Testing
When testing the widget in a browser, make sure to use HTTP:

```
✅ Correct URL for testing:
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e
```

## Why This Happens

1. **Server Configuration**: The server is configured to use HTTP in development mode (see `main.ts`)
2. **WebSocket Requirements**: Real-time updates require WebSocket connections, which need matching protocols
3. **Browser Security**: Modern browsers prefer HTTPS, but the server doesn't have SSL certificates configured

## Widget Behavior

### HTTP Access (✅ Recommended)
- Full functionality with real-time WebSocket updates
- Live donation total updates
- All features work correctly

### HTTP Static Mode (✅ Alternative)
- Static data only (no real-time updates)
- No WebSocket connection attempts
- No SSL/TLS issues
- Perfect for OBS when WebSocket causes problems
- Use: `?static=true` parameter

### HTTPS Access (❌ Not Recommended)
- Static data only (no real-time updates)
- Visual warning displayed
- WebSocket connections disabled
- Reduced functionality

## Technical Details

The widget automatically detects the protocol and:
- **HTTP**: Enables WebSocket connections for real-time updates
- **HTTPS**: Disables WebSocket and shows static data with warnings

## Production Setup

For production environments, you would need to:
1. Configure SSL certificates
2. Update server configuration to support HTTPS
3. Update WebSocket gateway configuration
4. Update widget URLs to use HTTPS

## Troubleshooting

### If you're still getting SSL errors:
1. Clear browser cache
2. Use incognito/private browsing mode
3. Ensure you're using the exact HTTP URL
4. Check that the server is running on port 3001
5. Verify the streamer ID is correct

### If WebSocket still tries to use HTTPS:
1. **Use Static Mode**: Add `?static=true` to disable WebSocket completely
   ```
   http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e?static=true
   ```

2. **Check Browser Console**: Look for these error patterns:
   - `net::ERR_SSL_PROTOCOL_ERROR`
   - `GET https://14.225.211.248:3001/socket.io/`
   - `WebSocket connection error`

3. **Force HTTP Protocol**: Make sure you're accessing via HTTP, not HTTPS

### Common Error Messages:
- `net::ERR_SSL_PROTOCOL_ERROR` → Use HTTP instead of HTTPS
- `WebSocket connection error` → Use static mode or fix protocol
- `Content Security Policy` → Use static mode to avoid WebSocket

## Quick Test

Test the widget with this URL:
```
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e
```

You should see the donation total without any SSL errors.

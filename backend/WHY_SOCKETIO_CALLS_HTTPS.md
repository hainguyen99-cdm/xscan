# Why Socket.IO Calls HTTPS Even on HTTP Server

## The Problem
Even when your server is running on HTTP and you access the page via HTTP, Socket.IO can still attempt HTTPS connections, causing `net::ERR_SSL_PROTOCOL_ERROR`.

## Root Causes

### 1. **Socket.IO Auto-Upgrade Behavior**
Socket.IO automatically tries to upgrade from HTTP polling to WebSocket connections. During this upgrade process, it can attempt HTTPS connections even when you specify HTTP.

### 2. **Browser Mixed Content Policies**
Modern browsers have strict policies about mixed content (HTTP page trying to connect to HTTPS resources). Socket.IO can trigger these policies.

### 3. **Socket.IO Transport Fallback**
Socket.IO tries multiple transport methods in this order:
1. WebSocket (can trigger HTTPS)
2. Server-Sent Events (can trigger HTTPS)
3. Long Polling (HTTP only)

### 4. **Protocol Detection Override**
Socket.IO has built-in protocol detection that can override your explicit HTTP configuration.

## Technical Details

### Socket.IO Connection Process:
```
1. Client connects via HTTP polling
2. Socket.IO attempts to upgrade to WebSocket
3. During upgrade, it may try HTTPS endpoints
4. Browser blocks HTTPS (server doesn't support SSL)
5. Connection fails with SSL error
```

### Why This Happens:
- **Socket.IO Engine.IO**: The underlying Engine.IO protocol has automatic protocol detection
- **Browser Security**: Browsers prefer HTTPS for WebSocket connections
- **Mixed Content**: HTTP pages connecting to HTTPS resources are blocked
- **Transport Upgrades**: Socket.IO tries to upgrade from polling to WebSocket

## Solutions Implemented

### 1. **Aggressive Protocol Validation**
```javascript
// Validate protocol before connection
if (protocol !== 'http:') {
    console.error('PROTOCOL ERROR: Only HTTP is supported');
    return;
}

// Validate URL before connection
if (socketUrl.includes('https://')) {
    console.error('URL VALIDATION ERROR: HTTPS detected');
    return;
}
```

### 2. **Network Request Interception**
```javascript
// Override fetch to block HTTPS requests
window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('https://')) {
        console.error('BLOCKED HTTPS FETCH REQUEST:', url);
        return Promise.reject(new Error('HTTPS requests blocked'));
    }
    return originalFetch.apply(this, args);
};

// Override XMLHttpRequest to block HTTPS requests
window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    xhr.open = function(method, url, ...args) {
        if (typeof url === 'string' && url.includes('https://')) {
            console.error('BLOCKED HTTPS XHR REQUEST:', url);
            throw new Error('HTTPS requests blocked');
        }
        return originalOpen.apply(this, [method, url, ...args]);
    };
    return xhr;
};
```

### 3. **Socket.IO Configuration Lockdown**
```javascript
socket = io(socketUrl, {
    // CRITICAL: Only use polling transport
    transports: ['polling'],
    upgrade: false,                    // Disable WebSocket upgrade
    rememberUpgrade: false,           // Don't remember upgrade attempts
    forceNew: true,                   // Force new connection
    secure: false,                     // Force HTTP
    rejectUnauthorized: false,         // Don't validate SSL
    allowEIO3: true,                  // Use older Engine.IO version
    forceBase64: false,               // Don't force base64 encoding
    withCredentials: false            // Don't send credentials
});
```

### 4. **Static Mode Fallback**
```javascript
// Use static mode to completely avoid WebSocket
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e?static=true
```

## Why This Happens Locally

### Common Scenarios:
1. **Browser Cache**: Cached HTTPS requests from previous sessions
2. **Mixed Content**: HTTP page with HTTPS resources
3. **Socket.IO Engine**: Automatic protocol detection
4. **Browser Security**: Modern browsers prefer HTTPS
5. **Development Tools**: Some dev tools can trigger HTTPS requests

### Debug Steps:
1. **Clear Browser Cache**: Remove all cached data
2. **Check Network Tab**: Look for HTTPS requests in browser dev tools
3. **Use Incognito Mode**: Test without any cached data
4. **Check Console**: Look for protocol-related errors
5. **Use Static Mode**: Bypass WebSocket completely

## Prevention Strategies

### 1. **Use Static Mode**
```
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e?static=true
```

### 2. **Force HTTP Protocol**
```javascript
// Always use HTTP URLs
const socketUrl = `http://${host}/obs-widget`;
```

### 3. **Disable WebSocket Upgrades**
```javascript
// Socket.IO configuration
transports: ['polling'],    // Only use polling
upgrade: false,             // Disable upgrades
```

### 4. **Network Request Blocking**
```javascript
// Block any HTTPS requests at the browser level
```

## Testing the Fix

### 1. **Check Console Logs**
Look for these messages:
- `Current protocol: http:`
- `Socket URL: http://...`
- `BLOCKED HTTPS FETCH REQUEST` (if any HTTPS attempts)

### 2. **Network Tab**
- Should only see HTTP requests
- No HTTPS requests should appear
- No SSL/TLS errors

### 3. **Visual Indicators**
- Green notice: "WebSocket connected"
- Red notice: "WebSocket disabled - SSL/TLS error"
- Orange notice: "Static mode - no WebSocket"

## Alternative Solutions

### 1. **Use Static Mode** (Recommended for OBS)
```
http://14.225.211.248:3001/api/widget-public/bank-total/68cbcda1a8142b7c55edcc3e?static=true
```

### 2. **Configure HTTPS Server** (Production)
- Add SSL certificates
- Update server configuration
- Use HTTPS URLs

### 3. **Use Different WebSocket Library**
- Native WebSocket API
- Different Socket.IO configuration
- Custom polling implementation

## Summary

The issue occurs because:
1. **Socket.IO has automatic protocol detection**
2. **Browsers prefer HTTPS for WebSocket connections**
3. **Mixed content policies block HTTP→HTTPS requests**
4. **Transport upgrades can trigger HTTPS attempts**

The solution involves:
1. **Aggressive protocol validation**
2. **Network request interception**
3. **Socket.IO configuration lockdown**
4. **Static mode fallback**

Use static mode (`?static=true`) for the most reliable solution in OBS.

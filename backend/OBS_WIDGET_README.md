# OBS Widget System Implementation

This document describes the implementation of the OBS widget system for Task 7, Step 1: "Implement widget link generation with secure tokens".

## Overview

The OBS widget system allows streamers to embed real-time donation alerts directly into their OBS streams using Browser Source. The system generates secure, unique tokens for each streamer and serves HTML/JS widgets that can connect to the backend via WebSocket for real-time updates.

## Architecture

### Components

1. **Alert Token Generation**: Secure, unique tokens generated for each streamer
2. **Widget Endpoint**: Public endpoint serving HTML/JS widgets
3. **WebSocket Integration**: Real-time communication for alerts
4. **Security**: Token-based authentication without exposing streamer credentials

### Endpoints

#### Public Widget Endpoint
```
GET /obs-settings/widget/:alertToken
```
- **Purpose**: Serves HTML/JS widget for OBS Browser Source
- **Authentication**: None (public access)
- **Response**: HTML page with embedded JavaScript
- **Use Case**: Direct embedding in OBS Browser Source

#### Token Validation Endpoint
```
GET /obs-settings/token/:alertToken
```
- **Purpose**: Validates alert token and returns OBS settings
- **Authentication**: None (public access)
- **Response**: JSON with OBS settings
- **Use Case**: Widget initialization and configuration

## Implementation Details

### 1. Alert Token Generation

Alert tokens are automatically generated when OBS settings are created:

```typescript
private generateAlertToken(): string {
  return randomBytes(32).toString('hex');
}
```

- **Length**: 64 characters (32 bytes in hex)
- **Uniqueness**: Guaranteed unique across all streamers
- **Security**: Cryptographically secure random generation
- **Regeneration**: Can be regenerated if compromised

### 2. Widget HTML Generation

The `generateWidgetHtml()` method creates a complete HTML page with:

- **Responsive Design**: Adapts to different OBS canvas sizes
- **Modern Styling**: CSS3 animations and gradients
- **WebSocket Integration**: Real-time connection to backend
- **Error Handling**: Graceful fallbacks for connection issues
- **Test Mode**: Built-in test alerts for verification

### 3. Widget Features

#### Visual Elements
- **Connection Status**: Real-time indicator showing WebSocket connection state
- **Alert Container**: Animated donation alert display
- **Progress Bar**: Visual countdown for alert duration
- **Responsive Layout**: Adapts to different screen sizes

#### Functionality
- **Auto-reconnection**: Automatically reconnects if connection is lost
- **Alert Management**: Handles multiple alert types (test, donation)
- **Animation System**: Smooth fade-in/fade-out transitions
- **Error Recovery**: Graceful handling of network issues

## Usage Instructions

### For Streamers

1. **Create OBS Settings**
   ```bash
   POST /obs-settings
   {
     "streamerId": "your-user-id",
     "imageSettings": { ... },
     "soundSettings": { ... },
     "animationSettings": { ... }
   }
   ```

2. **Get Widget URL**
   - The system automatically generates an `alertToken`
   - Widget URL: `http://your-backend/obs-settings/widget/{alertToken}`

3. **Add to OBS**
   - Open OBS Studio
   - Add new Browser Source
   - Enter the widget URL
   - Set width/height as needed
   - Enable "Refresh browser when scene becomes active"

### For Developers

#### Testing the Widget

1. **Use the Test Page**
   - Open `test-widget.html` in a browser
   - Enter a valid alert token
   - Click "Test Widget" to see the widget in action

2. **Test Token Endpoint**
   ```bash
   curl http://localhost:3001/obs-settings/token/{alertToken}
   ```

3. **Test Widget Endpoint**
   ```bash
   curl http://localhost:3001/obs-settings/widget/{alertToken}
   ```

#### Integration Testing

1. **WebSocket Connection**
   - Widget automatically connects to WebSocket server
   - Joins streamer-specific room for targeted alerts
   - Handles connection failures gracefully

2. **Alert Display**
   - Test alerts appear automatically after 2 seconds
   - Real alerts triggered via WebSocket messages
   - Auto-hide after configured duration

## Security Considerations

### Token Security
- **Length**: 64-character hex strings provide 256-bit security
- **Uniqueness**: Guaranteed unique across all streamers
- **Regeneration**: Tokens can be regenerated if compromised
- **Validation**: Server-side validation of all token requests

### Access Control
- **Public Widget Endpoint**: No authentication required for OBS access
- **Token Validation**: Tokens must be valid and active
- **Rate Limiting**: Applied at application level
- **CORS**: Configured for OBS compatibility

### Data Protection
- **No Sensitive Data**: Widgets only contain display information
- **Streamer Isolation**: Each token is tied to a specific streamer
- **Audit Trail**: All widget access is logged

## Configuration

### Environment Variables

```env
# Frontend URL for widget links
FRONTEND_URL=http://localhost:3000

# Backend URL for WebSocket connections
BACKEND_URL=http://localhost:3001
```

### Widget Customization

The widget can be customized through OBS settings:

- **Image Settings**: Background images, logos, avatars
- **Sound Settings**: Alert sounds, volume, fade effects
- **Animation Settings**: Entry/exit animations, timing
- **Style Settings**: Colors, fonts, borders, shadows
- **Position Settings**: Location, anchor points, z-index
- **Display Settings**: Duration, auto-hide, progress bars

## Troubleshooting

### Common Issues

1. **Widget Not Loading**
   - Verify alert token is valid
   - Check backend server is running
   - Ensure CORS is properly configured

2. **WebSocket Connection Failed**
   - Check WebSocket server status
   - Verify backend URL configuration
   - Check firewall/network settings

3. **Alerts Not Displaying**
   - Verify WebSocket connection
   - Check alert configuration
   - Review browser console for errors

### Debug Mode

The widget includes built-in debugging:

- **Connection Status**: Visual indicator of WebSocket state
- **Console Logging**: Detailed connection and alert logs
- **Error Handling**: Graceful fallbacks for all failure modes

## Future Enhancements

### Planned Features
- **Multiple Alert Types**: Different styles for donations, subscriptions, etc.
- **Custom CSS**: Streamer-defined styling options
- **Alert Queuing**: Handle multiple simultaneous alerts
- **Analytics**: Track alert performance and engagement
- **Mobile Support**: Responsive design for mobile streams

### Performance Optimizations
- **Asset Preloading**: Cache images and sounds
- **Animation Optimization**: Hardware-accelerated transitions
- **Memory Management**: Efficient DOM manipulation
- **Network Optimization**: WebSocket connection pooling

## API Reference

### Widget Endpoint Response

```html
<!DOCTYPE html>
<html>
<head>
  <title>OBS Alert Widget</title>
  <style>/* Embedded CSS */</style>
</head>
<body>
  <div class="widget-container">
    <!-- Widget HTML structure -->
  </div>
  <script>
    // Embedded JavaScript with WebSocket integration
  </script>
</body>
</html>
```

### WebSocket Messages

#### Join Room
```json
{
  "type": "joinStreamerRoom",
  "streamerId": "streamer-id"
}
```

#### Alert Messages
```json
{
  "type": "donationAlert",
  "donorName": "Donor Name",
  "amount": "25.00",
  "message": "Thank you!",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Conclusion

The OBS widget system provides a secure, scalable solution for embedding real-time donation alerts in OBS streams. The implementation follows security best practices while maintaining ease of use for streamers and developers.

The system is designed to be:
- **Secure**: Token-based authentication with cryptographic security
- **Reliable**: Robust error handling and auto-reconnection
- **Customizable**: Extensive configuration options for streamers
- **Performant**: Optimized for real-time streaming environments
- **Maintainable**: Clean, documented code with comprehensive testing

For questions or support, refer to the main project documentation or create an issue in the project repository. 
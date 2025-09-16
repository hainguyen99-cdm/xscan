# OBS Widget URL Format

## Overview

The OBS widget system now supports a new URL format that includes the streamer ID in the path, making it easier for OBS to integrate while maintaining security through the alert token.

## URL Format

### New Format (Recommended)
```
{domain}/widget/streamer-{streamerId}/{alertToken}
```

**Example:**
```
https://yourdomain.com/widget/streamer-507f1f77bcf86cd799439011/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Legacy Format (Backward Compatible)
```
{domain}/widget/alert/{alertToken}
```

## Benefits of New Format

1. **OBS Integration**: OBS only allows pasting URLs, so including the streamer ID in the path makes it easier to identify which streamer the widget belongs to.

2. **Security**: The alert token is still required and validated against the streamer ID to prevent unauthorized access.

3. **User Experience**: Streamers can easily identify their widget URL and share it with their team.

4. **Backward Compatibility**: Existing widget URLs continue to work.

## API Endpoints

### Get Widget URL
```
GET /obs-settings/widget-url/{streamerId}
```

**Response:**
```json
{
  "widgetUrl": "https://yourdomain.com/widget/streamer-507f1f77bcf86cd799439011/abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "streamerId": "507f1f77bcf86cd799439011",
  "alertToken": "abc123de..."
}
```

### Access Widget
```
GET /obs-settings/widget/streamer-{streamerId}/{alertToken}
```

## OBS Setup Instructions

1. **Get Your Widget URL:**
   - Log into your account
   - Navigate to OBS Settings
   - Copy the widget URL from the dashboard

2. **Add Browser Source in OBS:**
   - In OBS, add a new Browser Source
   - Paste the widget URL in the URL field
   - Set the width and height as needed
   - Click OK

3. **Test the Widget:**
   - Use the test alert feature to verify the widget is working
   - The widget will display alerts when donations are received

## Security Features

- **Token Validation**: The alert token is validated against the streamer ID
- **Rate Limiting**: API endpoints are protected against abuse
- **IP Validation**: Optional IP address validation for enhanced security
- **Token Rotation**: Tokens can be regenerated for security

## Troubleshooting

### Widget Not Displaying
- Verify the URL is correct
- Check that the streamer ID and alert token match
- Ensure the widget is properly configured in OBS

### Connection Issues
- Check the connection status indicator in the widget
- Verify the backend service is running
- Check network connectivity

### Alerts Not Triggering
- Verify the alert token is correct
- Check that the widget is connected to the WebSocket
- Test with the test alert feature

## Migration from Legacy Format

If you're currently using the legacy widget URL format, you can:

1. **Keep using the legacy format** - it will continue to work
2. **Update to the new format** - get the new URL from the dashboard
3. **Use both formats** - they can coexist in the same system

## Support

For issues with the widget system, check:
1. The OBS integration guide
2. The troubleshooting documentation
3. The security features documentation 
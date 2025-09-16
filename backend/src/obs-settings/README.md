# OBS Settings Module

This module provides comprehensive OBS (Open Broadcaster Software) alert configuration management for streamers and KOLs (Key Opinion Leaders).

## Features

- **Complete OBS Alert Customization**: Configure images, sounds, animations, colors, fonts, positions, and display duration
- **Alert Token Management**: Secure, unique tokens for OBS widget integration
- **Role-Based Access Control**: Streamers can manage their own settings, admins can manage all
- **Comprehensive API**: Full CRUD operations with validation and error handling
- **Statistics and Monitoring**: Track usage and performance metrics

## Schema Structure

### Core Fields
- `streamerId`: Reference to the User model (streamer/KOL)
- `alertToken`: Unique 64-character hex token for OBS widget
- `isActive`: Whether the settings are currently active
- `totalAlerts`: Count of total alerts displayed
- `lastUsedAt`: Timestamp of last alert usage

### Image Settings
- **Media Type**: Image, GIF, or video support
- **Dimensions**: Width, height with validation (50-1920px, 50-1080px)
- **Styling**: Border radius, shadow effects with customizable properties
- **File Management**: URL storage for media files

### Sound Settings
- **Audio Control**: Volume, fade in/out effects
- **Loop Support**: Option to repeat audio
- **File Management**: URL storage for audio files

### Animation Effects
- **Animation Types**: Fade, slide, bounce, zoom, or none
- **Timing Control**: Duration and easing functions
- **Direction Control**: Left, right, top, bottom movement
- **Custom Effects**: Bounce intensity, zoom scale

### Style Settings
- **Color Scheme**: Background, text, accent, and border colors
- **Typography**: Font family, size, weight, style
- **Border Styling**: Width, style (solid, dashed, dotted, none)
- **Text Effects**: Shadow with customizable properties

### Position Settings
- **Coordinates**: X, Y positioning (0-1920, 0-1080)
- **Anchor Points**: 9-point positioning system
- **Layering**: Z-index control (0-9999)
- **Responsiveness**: Mobile scaling support

### Display Settings
- **Duration Control**: Display time (1-30 seconds)
- **Transition Effects**: Fade in/out timing
- **Auto-hide**: Automatic dismissal
- **Progress Bar**: Visual countdown with customization

### General Settings
- **Alert Limits**: Maximum concurrent alerts (1-10)
- **Spacing Control**: Alert separation distance
- **Cooldown**: Minimum time between alerts
- **Priority Levels**: Low, medium, high, urgent

## API Endpoints

### Authentication Required
All endpoints require JWT authentication and appropriate role permissions.

### Streamer Endpoints
- `POST /obs-settings` - Create OBS settings
- `GET /obs-settings/my-settings` - Get current user's settings
- `PATCH /obs-settings/my-settings` - Update current user's settings
- `DELETE /obs-settings/my-settings` - Delete current user's settings
- `POST /obs-settings/my-settings/toggle-active` - Toggle active status
- `POST /obs-settings/my-settings/regenerate-token` - Generate new alert token

### Admin Endpoints
- `GET /obs-settings` - Get all OBS settings
- `GET /obs-settings/streamer/:streamerId` - Get settings by streamer ID
- `PATCH /obs-settings/:streamerId` - Update settings by streamer ID
- `DELETE /obs-settings/:streamerId` - Delete settings by streamer ID
- `POST /obs-settings/:streamerId/toggle-active` - Toggle active status
- `POST /obs-settings/:streamerId/regenerate-token` - Generate new alert token
- `GET /obs-settings/stats/overview` - Get statistics overview

### Public Endpoints
- `GET /obs-settings/token/:alertToken` - Get settings by alert token (for OBS widget)

## Usage Examples

### Creating OBS Settings
```typescript
const settings = await obsSettingsService.create({
  streamerId: 'user123',
  imageSettings: {
    enabled: true,
    type: 'image',
    width: 400,
    height: 300,
    borderRadius: 12,
  },
  soundSettings: {
    enabled: true,
    volume: 90,
    fadeIn: 500,
  },
  styleSettings: {
    backgroundColor: '#2a2a2a',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
  },
});
```

### Updating Settings
```typescript
const updated = await obsSettingsService.update('user123', {
  imageSettings: {
    width: 500,
    height: 400,
  },
  displaySettings: {
    duration: 8000,
  },
});
```

### Finding Settings by Token
```typescript
const settings = await obsSettingsService.findByAlertToken('abc123...');
```

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Role-Based Access**: Streamers can only access their own settings
- **Input Validation**: Comprehensive DTO validation with class-validator
- **Secure Token Generation**: Cryptographically secure random tokens
- **MongoDB Injection Protection**: Proper ObjectId handling

## Database Indexes

- **Compound Index**: `{ streamerId: 1, isActive: 1 }` for efficient queries
- **Unique Index**: `{ alertToken: 1 }` for token uniqueness
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields

## Error Handling

- **404 Not Found**: Settings not found for streamer/token
- **409 Conflict**: Duplicate settings creation
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient role permissions

## Testing

Run the test suite:
```bash
npm run test obs-settings.schema.spec.ts
```

## Dependencies

- `@nestjs/mongoose` - MongoDB integration
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation
- `mongoose` - MongoDB ODM

## Future Enhancements

- **Template System**: Pre-configured alert themes
- **Bulk Operations**: Batch update multiple streamers
- **Webhook Integration**: Real-time settings updates
- **Analytics Dashboard**: Detailed usage statistics
- **Export/Import**: Settings backup and restore 
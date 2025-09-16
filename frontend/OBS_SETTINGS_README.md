# OBS Alert Configuration System

This document describes the OBS Alert Configuration system implemented for the XScan donation platform, which allows streamers and KOLs to customize their donation alerts for OBS streaming.

## Overview

The OBS Alert Configuration system provides a comprehensive interface for streamers to:
- Upload and configure media (images, GIFs, videos, sounds)
- Customize visual appearance (colors, fonts, animations)
- Set positioning and display duration
- Preview alerts in real-time
- Generate widget URLs for OBS integration

## Components

### 1. OBSSettingsConfig (`/src/components/OBSSettingsConfig.tsx`)

The main configuration component that provides:
- **Media Settings**: Upload and configure images, GIFs, videos (≤10s) and sounds (≤5s)
- **Display Settings**: Animation effects, colors, typography, positioning, and duration
- **Live Preview**: Real-time preview of how alerts will appear
- **Widget Information**: Display of widget URL and alert token

### 2. OBSWidgetDemo (`/src/components/OBSWidgetDemo.tsx`)

A demonstration component that shows how the alert will appear in OBS:
- Simulates the OBS browser source environment
- Demonstrates animations and positioning
- Shows media playback
- Provides widget information

### 3. OBS Settings Page (`/src/app/dashboard/obs-settings/page.tsx`)

The main page that brings everything together:
- Hosts the configuration interface
- Provides demo functionality
- Includes usage instructions

### 4. OBS Widget (`/src/app/widget/alert/[streamerId]/page.tsx`)

The actual widget that OBS loads:
- Renders donation alerts based on configuration
- Supports all customization options
- Handles media playback and animations
- Optimized for OBS browser sources

### 5. Widget Test Page (`/src/app/widget/alert/test/page.tsx`)

A testing interface for developers and streamers:
- Demonstrates widget functionality
- Provides testing controls
- Shows widget features and capabilities

## Features

### Media Configuration
- **Images**: Support for JPG, PNG, GIF formats
- **Videos**: MP4, WebM, MOV (max 10 seconds)
- **Sounds**: MP3, WAV (max 5 seconds)
- **File Validation**: Automatic type detection and size validation

### Visual Customization
- **Animations**: Fade, Slide, Bounce, None
- **Colors**: Background, text, and accent color pickers
- **Typography**: Font family, size, and weight selection
- **Positioning**: Predefined positions (top-left, top-right, etc.) or custom coordinates

### Live Preview
- Real-time updates as settings change
- Interactive media playback
- Position and animation demonstration
- Responsive design matching OBS environment

### Widget Functionality
- **Transparent Background**: Perfect for OBS integration
- **Real-time Alerts**: WebSocket/SSE ready for live alerts
- **Media Support**: Images, videos, and audio playback
- **Responsive Design**: Adapts to different OBS source sizes

## Usage

### For Streamers

1. **Access Configuration**:
   - Navigate to Dashboard → Quick Actions → Configure OBS Alert
   - Or directly visit `/dashboard/obs-settings`

2. **Configure Media**:
   - Upload custom images, GIFs, or videos
   - Add sound effects
   - Set volume and duration limits

3. **Customize Appearance**:
   - Choose animation effects
   - Select colors and fonts
   - Set position and display duration

4. **Preview and Test**:
   - Use live preview to see changes
   - Test alert functionality
   - Preview OBS widget appearance

5. **Save and Deploy**:
   - Save configuration
   - Copy widget URL for OBS
   - Add as browser source in OBS

### For Developers

1. **Component Integration**:
   ```tsx
   import OBSSettingsConfig from '../components/OBSSettingsConfig';
   
   <OBSSettingsConfig
     settings={obsSettings}
     onSave={handleSave}
     onTest={handleTest}
   />
   ```

2. **Type Definitions**:
   - `OBSSettings`: Complete settings interface
   - `UpdateOBSSettingsForm`: Form data for updates
   - All types defined in `/src/types/index.ts`

3. **Styling**:
   - Uses Tailwind CSS with custom animations
   - Responsive grid layout
   - Consistent with existing UI components

## API Endpoints

### Alert Triggering
- **POST** `/api/alerts/trigger` - Trigger a donation alert
  ```json
  {
    "streamerId": "streamer-1",
    "alertData": {
      "donorName": "John Doe",
      "amount": 25.00,
      "currency": "USD",
      "message": "Great stream!"
    }
  }
  ```

### Widget Endpoints
- **GET** `/widget/alert/test` - Test widget page
- **GET** `/widget/alert/[streamerId]` - Streamer's OBS widget

## Testing

### Widget Testing
1. **Visit Test Page**: Navigate to `/widget/alert/test`
2. **Trigger Alerts**: Use the test controls to simulate donations
3. **OBS Integration**: Add as browser source in OBS Studio

### OBS Setup
1. **Add Browser Source**: In OBS, add a new Browser Source
2. **Set URL**: Use `http://localhost:3000/widget/alert/streamer-1`
3. **Configure Size**: Set width to 400px, height to 300px
4. **Enable Options**: Check "Shutdown source when not visible"
5. **Test Alerts**: Use the configuration page to trigger test alerts

## Technical Implementation

### State Management
- Local state for form data and preview
- Real-time synchronization between form and preview
- File upload handling with FileReader API

### Animation System
- CSS animations defined in Tailwind config
- Smooth transitions for all effects
- Performance-optimized keyframes

### File Handling
- Client-side file validation
- Base64 encoding for preview
- Support for various media formats

### Responsive Design
- Mobile-first approach
- Grid-based layout system
- Adaptive preview sizing

### Widget Architecture
- **Client-side Rendering**: React-based widget for OBS
- **API Integration**: RESTful endpoints for alert triggering
- **Real-time Updates**: WebSocket/SSE ready for live alerts
- **OBS Optimization**: Transparent backgrounds and smooth animations

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── OBSSettingsConfig.tsx    # Main configuration component
│   │   ├── OBSWidgetDemo.tsx        # OBS widget demonstration
│   │   └── ui/                      # Reusable UI components
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── obs-settings/
│   │   │       └── page.tsx         # OBS settings page
│   │   ├── widget/
│   │   │   └── alert/
│   │   │       ├── [streamerId]/
│   │   │       │   ├── page.tsx     # OBS widget
│   │   │       │   └── layout.tsx   # Widget layout
│   │   │       ├── test/
│   │   │       │   └── page.tsx     # Widget test page
│   │   │       └── globals.css      # Widget-specific styles
│   │   └── api/
│   │       └── alerts/
│   │           └── trigger/
│   │               └── route.ts     # Alert trigger API
│   └── types/
│       └── index.ts                 # Type definitions
├── tailwind.config.js               # CSS animations
└── OBS_SETTINGS_README.md           # This file
```

## Dependencies

- **React 18+**: Hooks and modern React patterns
- **Next.js 14**: App router and server components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **TypeScript**: Type safety and development experience

## Browser Support

- Modern browsers with ES6+ support
- File API support for uploads
- CSS animations and transitions
- Audio/Video playback capabilities

## Future Enhancements

- **Advanced Animations**: More complex animation sequences
- **Template System**: Pre-built alert templates
- **A/B Testing**: Multiple alert variations
- **Analytics**: Alert performance metrics
- **Mobile App**: Native mobile configuration
- **API Integration**: Real-time alert triggering
- **WebSocket Support**: Live alert delivery
- **Alert Queue**: Multiple alert management
- **Custom CSS**: Advanced styling options

## Troubleshooting

### Common Issues

1. **File Upload Fails**:
   - Check file size limits (10s for video, 5s for audio)
   - Verify file format support
   - Ensure browser supports File API

2. **Preview Not Working**:
   - Check browser console for errors
   - Verify Tailwind CSS is loaded
   - Ensure all dependencies are installed

3. **Animations Not Smooth**:
   - Check device performance
   - Verify CSS animations are enabled
   - Reduce animation complexity if needed

4. **Widget Not Loading in OBS**:
   - Verify the URL is correct
   - Check browser source settings
   - Ensure "Shutdown source when not visible" is enabled
   - Test the widget URL in a regular browser first

### Performance Tips

- Use optimized media files
- Limit animation complexity on mobile
- Implement lazy loading for large files
- Cache configuration data
- Use appropriate OBS source dimensions

## Contributing

When contributing to the OBS Settings system:

1. Follow existing code patterns
2. Add TypeScript types for new features
3. Include responsive design considerations
4. Test across different browsers
5. Test OBS integration thoroughly
6. Update this documentation

## License

This component is part of the XScan donation platform and follows the same licensing terms. 
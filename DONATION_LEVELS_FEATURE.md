# Donation Levels Feature

This document describes the new donation level-based OBS settings system that allows streamers to configure different alert settings for different donation amounts.

## Overview

The donation levels feature enables streamers to create multiple alert configurations based on donation amount ranges. For example:
- 0-100,000 VND: Basic alert with simple animation
- 100,000-1,000,000 VND: Enhanced alert with special effects
- 1,000,000+ VND: Premium alert with custom media and animations

## Features

### 1. Multiple Donation Levels
- Create unlimited donation level configurations
- Each level has a name, min/max amount range, and currency
- Enable/disable individual levels
- Automatic amount range validation

### 2. Level-Specific Configuration
Each donation level can have its own:
- **Image/Video Settings**: Custom media for each level
- **Sound Settings**: Different audio alerts per level
- **Animation Settings**: Level-specific animations and effects
- **Style Settings**: Custom colors, fonts, and styling
- **Position Settings**: Different positioning per level
- **Display Settings**: Custom duration and display options

### 3. User Interface
- **Tabbed Interface**: Separate "Basic Settings" and "Donation Levels" tabs
- **Level Management**: Add, edit, delete, and reorder levels
- **Live Preview**: Test each level configuration
- **Bulk Operations**: Save all levels at once

## Technical Implementation

### Backend Changes

#### Database Schema
```typescript
// Added to OBSSettings schema
donationLevels: Array<{
  levelId: string;
  levelName: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  isEnabled: boolean;
  configuration: {
    imageSettings?: any;
    soundSettings?: any;
    animationSettings?: any;
    styleSettings?: any;
    positionSettings?: any;
    displaySettings?: any;
    generalSettings?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}>;
```

#### API Endpoints
- `GET /api/obs-settings/donation-levels` - Get all donation levels
- `PUT /api/obs-settings/donation-levels` - Update donation levels
- `POST /api/obs-settings/test-donation-level` - Test specific level

#### DTOs
- `CreateDonationLevelDto` - Create new donation level
- `UpdateDonationLevelDto` - Update existing level
- `DonationLevelResponseDto` - Level response format
- `DonationLevelFormDto` - Frontend form format

### Frontend Changes

#### Components
- `DonationLevelConfig.tsx` - Main donation level management component
- Updated `OBSSettingsPage.tsx` - Added tabbed interface
- Updated `types/index.ts` - Added DonationLevel interface

#### State Management
- `donationLevels` state for managing levels
- `activeTab` state for tab navigation
- `editingLevel` state for level editing modal

## Usage

### 1. Accessing Donation Levels
1. Navigate to `/dashboard/obs-settings/`
2. Click on the "Donation Levels" tab
3. Start creating your donation level configurations

### 2. Creating a Donation Level
1. Click "Add Level" button
2. Fill in level details:
   - Level name (e.g., "Small Donation")
   - Minimum amount (e.g., 0)
   - Maximum amount (e.g., 100000)
   - Currency (VND, USD, EUR)
3. Configure level-specific settings:
   - Upload custom image/video
   - Upload custom sound
   - Set animation type and duration
   - Choose colors and fonts
   - Set position and display duration
4. Click "Save Level"

### 3. Testing Levels
1. Click "Test" button on any level
2. Check your OBS widget to see the level-specific alert
3. Verify the configuration matches your expectations

### 4. Managing Levels
- **Edit**: Click "Edit" button to modify level settings
- **Delete**: Click trash icon to remove level
- **Enable/Disable**: Toggle level status
- **Reorder**: Drag and drop to change level priority

## Configuration Examples

### Example 1: Basic Tier System
```
Level 1: "Small Donation"
- Range: 0 - 100,000 VND
- Simple fade animation
- Basic sound
- 3-second duration

Level 2: "Medium Donation"  
- Range: 100,000 - 1,000,000 VND
- Bounce animation
- Enhanced sound
- 5-second duration

Level 3: "Big Donation"
- Range: 1,000,000+ VND
- Zoom animation with custom media
- Premium sound
- 8-second duration
```

### Example 2: Currency-Specific Levels
```
USD Levels:
- $1-$10: Basic alert
- $10-$50: Enhanced alert
- $50+: Premium alert

VND Levels:
- 0-100k VND: Basic alert
- 100k-1M VND: Enhanced alert
- 1M+ VND: Premium alert
```

## Benefits

1. **Personalized Experience**: Different alerts for different donation amounts
2. **Visual Hierarchy**: Higher donations get more impressive alerts
3. **Flexibility**: Unlimited levels and configurations
4. **Easy Management**: Intuitive interface for level management
5. **Testing**: Test each level before going live
6. **Scalability**: Add new levels as your stream grows

## Migration

Existing OBS settings will continue to work as "Basic Settings". The donation levels feature is additive and doesn't break existing functionality.

## Future Enhancements

1. **Level Templates**: Pre-built level configurations
2. **Analytics**: Track which levels are triggered most
3. **Conditional Logic**: More complex level matching rules
4. **Time-based Levels**: Different levels for different times
5. **User-specific Levels**: Custom levels for specific donors

## Troubleshooting

### Common Issues

1. **Level not triggering**: Check amount ranges don't overlap incorrectly
2. **Media not loading**: Verify file size limits (10MB max)
3. **Test not working**: Ensure OBS widget is connected and visible
4. **Settings not saving**: Check network connection and try again

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

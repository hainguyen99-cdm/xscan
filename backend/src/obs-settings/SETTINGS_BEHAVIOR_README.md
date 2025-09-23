# OBS Settings Behavior Configuration

This feature allows streamers to control how their donation alerts use OBS settings - whether to use basic settings, donation levels, or automatically choose based on the donation amount.

## Overview

When a donation is received, the system needs to decide which settings to use for the alert. Previously, it would automatically use donation levels if they matched the donation amount, otherwise fall back to basic settings. Now streamers have full control over this behavior.

## Settings Behavior Options

### 1. Auto (Recommended)
- **Default behavior**
- Uses donation levels when they match the donation amount
- Falls back to basic settings when no matching donation level is found
- This is the original behavior and works well for most streamers

### 2. Basic Settings Only
- Always uses the basic OBS settings
- Completely ignores donation levels, even if they exist
- Useful when streamers want consistent alerts regardless of donation amount

### 3. Donation Levels Only
- Always tries to use donation levels if any are configured
- Uses the first available donation level if no specific match is found
- Falls back to basic settings only if no donation levels are configured
- Useful when streamers want to always use level-specific styling

## API Endpoints

### Get Current Settings Behavior
```http
GET /obs-settings/settings-behavior
Authorization: Bearer <token>
```

Response:
```json
{
  "settingsBehavior": "auto"
}
```

### Update Settings Behavior
```http
PUT /obs-settings/settings-behavior
Authorization: Bearer <token>
Content-Type: application/json

{
  "settingsBehavior": "basic"
}
```

Response:
```json
{
  "success": true,
  "message": "Settings behavior updated to: basic"
}
```

## Frontend Integration

The settings behavior can be configured in the OBS Settings dashboard at `/dashboard/obs-settings`. A new "Settings Behavior" card has been added with radio button options for each behavior type.

## Technical Implementation

### Backend Changes

1. **Schema Update**: Added `settingsBehavior` field to `OBSSettings` schema
2. **Service Method**: New `getSettingsForDonation()` method handles the logic
3. **Gateway Update**: `sendDonationAlert()` now uses the new method
4. **Test Alerts**: Test alerts also respect the settings behavior

### Frontend Changes

1. **Type Definition**: Added `settingsBehavior` to `OBSSettings` interface
2. **UI Component**: New settings behavior configuration card
3. **API Integration**: New API route for updating settings behavior

## Usage Examples

### Scenario 1: Streamer wants consistent alerts
- Set `settingsBehavior` to `"basic"`
- All donations will use the same basic settings regardless of amount

### Scenario 2: Streamer wants level-specific alerts
- Set `settingsBehavior` to `"donation-levels"`
- All donations will use donation level settings if available

### Scenario 3: Streamer wants smart behavior (default)
- Set `settingsBehavior` to `"auto"`
- System automatically chooses the best settings based on donation amount

## Migration

Existing streamers will automatically get the `"auto"` behavior, which maintains the current functionality. No migration is required.

## Testing

Test the different behaviors by:
1. Configuring both basic settings and donation levels
2. Setting the behavior to different options
3. Sending test donations with different amounts
4. Verifying the correct settings are used in the alerts

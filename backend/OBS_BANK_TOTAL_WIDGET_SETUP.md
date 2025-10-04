# OBS Bank Donation Total Widget Setup Guide

This guide will help you set up the Bank Donation Total Widget in OBS Studio.

## Prerequisites

- OBS Studio installed
- Access to your streamer account
- Backend server running

## Step 1: Get Your Streamer ID

1. Log into your streamer account
2. Navigate to your profile or dashboard
3. Copy your Streamer ID (it looks like: `64a1b2c3d4e5f6789abcdef0`)

## Step 2: Add Browser Source in OBS

1. **Open OBS Studio**
2. **Select your scene** where you want to add the widget
3. **Right-click in the Sources panel** → **Add** → **Browser Source**
4. **Name your source** (e.g., "Bank Donation Total")

## Step 3: Configure the Widget

### Basic Configuration

1. **URL**: Enter your widget URL:
   ```
   http://your-domain.com/api/widget-public/bank-total/YOUR_STREAMER_ID
   ```

2. **Width**: `400` (adjust as needed)
3. **Height**: `200` (adjust as needed)
4. **Refresh browser when scene becomes active**: ✅ (checked)

### Advanced Configuration

For more customization, add query parameters to the URL:

```
http://your-domain.com/api/widget-public/bank-total/YOUR_STREAMER_ID?theme=dark&showStats=true
```

**Available Parameters**:
- `theme`: `dark` (default), `light`, or `transparent`
- `showStats`: `true` or `false` (default: `false`)

## Step 4: Position and Style

1. **Position the widget** where you want it on your stream
2. **Resize if needed** by dragging the corners
3. **Test different themes** to match your stream's aesthetic

## Step 5: Test the Widget

1. **Make a test bank donation** to your account
2. **Check if the widget updates** (it refreshes every 30 seconds)
3. **Verify the display** shows the correct total

## Widget Examples

### Basic Widget (Dark Theme)
```
http://your-domain.com/api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0
```
- Shows total amount only
- Dark theme with blue accents
- Compact size (400x200)

### Detailed Widget (Light Theme)
```
http://your-domain.com/api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0?theme=light&showStats=true
```
- Shows total amount + statistics
- Light theme
- Larger size needed (500x400)

### Transparent Overlay
```
http://your-domain.com/api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0?theme=transparent
```
- Semi-transparent background
- Good for overlaying on video
- Compact size (400x200)

## Recommended Settings

### For Small Overlays
- **Width**: 300-400px
- **Height**: 150-200px
- **Theme**: `transparent` or `dark`
- **Show Stats**: `false`

### For Detailed Displays
- **Width**: 500-600px
- **Height**: 300-400px
- **Theme**: `dark` or `light`
- **Show Stats**: `true`

### For Mobile Streams
- **Width**: 350px
- **Height**: 180px
- **Theme**: `dark`
- **Show Stats**: `false`

## Troubleshooting

### Widget Not Loading
1. **Check the URL** - make sure it's correct
2. **Verify streamer ID** - ensure it exists in the system
3. **Check network connection** - OBS needs internet access
4. **Try refreshing** the browser source

### No Data Showing
1. **Verify bank donations exist** for your streamer ID
2. **Check if donations are processed** - they need to be in the database
3. **Wait for auto-refresh** - widget updates every 30 seconds

### Styling Issues
1. **Try different themes** - `dark`, `light`, or `transparent`
2. **Adjust OBS browser source settings**
3. **Check if custom CSS is interfering**

### Performance Issues
1. **Reduce refresh rate** - uncheck "Refresh browser when scene becomes active"
2. **Use basic widget** - disable `showStats=true`
3. **Check OBS performance** - monitor CPU usage

## Advanced Usage

### Multiple Widgets
You can add multiple instances of the widget with different configurations:
- One showing total only (compact)
- One showing detailed stats (larger)
- Different themes for different scenes

### Scene-Specific Widgets
Create different scenes with different widget configurations:
- **Starting Soon**: Basic widget with total only
- **Main Stream**: Detailed widget with stats
- **Ending**: Transparent widget overlay

### Custom Styling
If you need custom styling, you can:
1. **Modify the widget code** in the backend
2. **Use OBS filters** to adjust appearance
3. **Add custom CSS** through OBS browser source settings

## Security Notes

- The widget is **publicly accessible** - no authentication required
- **Streamer ID is visible** in the URL
- **No sensitive data** is exposed in the widget
- **Rate limiting** may be applied to prevent abuse

## Support

If you encounter issues:
1. **Check the logs** in your backend server
2. **Verify database connectivity**
3. **Test the widget URL** directly in a browser
4. **Contact support** with specific error messages

## Updates

The widget automatically updates every 30 seconds. For immediate updates:
1. **Right-click the browser source** in OBS
2. **Select "Refresh"** to force an update
3. **Or restart the scene** to trigger a refresh

# Bank Donation Total Widget

This widget displays the total amount donated via bank transfers for a specific streamer. It's designed to be used in OBS (Open Broadcaster Software) as a browser source to show real-time bank donation totals.

## Features

- **Real-time Total**: Shows the total amount donated via bank transfers
- **Multiple Themes**: Dark, light, and transparent themes
- **Detailed Statistics**: Optional display of transaction count, average donation, daily/weekly/monthly totals
- **Auto-refresh**: Automatically updates every 30 seconds
- **Responsive Design**: Adapts to different screen sizes
- **OBS Ready**: Optimized for use as a browser source in OBS

## API Endpoints

### Get Bank Donation Total Widget

**Endpoint**: `GET /api/widget-public/bank-total/{streamerId}`

**Query Parameters**:
- `format` (optional): Response format - `html` (default) or `json`
- `theme` (optional): Widget theme - `dark` (default), `light`, or `transparent`
- `showStats` (optional): Show additional statistics - `true` or `false` (default: `false`)

**Examples**:
```
# Basic widget (HTML)
GET /api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0

# JSON response with stats
GET /api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0?format=json&showStats=true

# Light theme with stats
GET /api/widget-public/bank-total/64a1b2c3d4e5f6789abcdef0?theme=light&showStats=true
```

## Usage in OBS

1. **Add Browser Source**:
   - In OBS, add a new "Browser Source"
   - Set the URL to: `http://your-domain.com/api/widget-public/bank-total/{streamerId}`
   - Add query parameters as needed (e.g., `?theme=dark&showStats=true`)

2. **Configure Settings**:
   - Width: 400-600px (adjust based on content)
   - Height: 200-400px (adjust based on whether stats are shown)
   - Refresh browser when scene becomes active: ✅ (recommended)

3. **Customization**:
   - Use different themes for different scenes
   - Toggle stats display based on your needs
   - The widget will automatically refresh every 30 seconds

## Frontend Widget

The widget is also available as a React component at:
`/widget/bank-total/{streamerId}`

**URL Parameters**:
- `theme`: `dark`, `light`, or `transparent`
- `showStats`: `true` or `false`

**Example**:
```
http://your-domain.com/widget/bank-total/64a1b2c3d4e5f6789abcdef0?theme=dark&showStats=true
```

## Data Structure

### Basic Stats Response
```json
{
  "success": true,
  "streamerId": "64a1b2c3d4e5f6789abcdef0",
  "data": {
    "totalAmount": 1500000,
    "currency": "VND",
    "transactionCount": 25,
    "lastDonationDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Detailed Stats Response (when showStats=true)
```json
{
  "success": true,
  "streamerId": "64a1b2c3d4e5f6789abcdef0",
  "data": {
    "totalAmount": 1500000,
    "currency": "VND",
    "transactionCount": 25,
    "lastDonationDate": "2024-01-15T10:30:00.000Z",
    "averageDonation": 60000,
    "todayDonations": 150000,
    "thisWeekDonations": 300000,
    "thisMonthDonations": 750000
  }
}
```

## Themes

### Dark Theme (Default)
- Dark background with blue accents
- White text with good contrast
- Suitable for dark OBS scenes

### Light Theme
- Light background with blue accents
- Dark text for readability
- Suitable for light OBS scenes

### Transparent Theme
- Semi-transparent background
- High contrast text with shadows
- Suitable for overlaying on video content

## Styling

The widget uses CSS custom properties and can be further customized by modifying the theme styles in the controller or frontend component.

## Error Handling

- If the streamer ID is invalid, an error message is displayed
- If there are no bank donations, the widget shows "0" with the appropriate currency
- Network errors are handled gracefully with retry mechanisms

## Performance

- Database queries are optimized with proper indexing
- Widget caches data for 30 seconds to reduce database load
- Auto-refresh prevents stale data display

## Security

- No authentication required for public widget access
- Streamer ID validation prevents unauthorized access
- Rate limiting can be implemented if needed

## Dependencies

- MongoDB for bank transaction data
- NestJS for backend API
- React for frontend widget
- Socket.io for real-time updates (optional)

## Troubleshooting

1. **Widget not loading**: Check if the streamer ID is correct and exists
2. **No data showing**: Verify that bank transactions exist for the streamer
3. **Styling issues**: Ensure OBS browser source settings are correct
4. **Auto-refresh not working**: Check browser console for JavaScript errors

## Development

To modify the widget:

1. **Backend**: Edit `bank-donation-total.controller.ts` and `bank-donation-total.service.ts`
2. **Frontend**: Edit `frontend/src/app/widget/bank-total/[streamerId]/page.tsx`
3. **Static HTML**: Edit `backend/public/widget/bank-total/index.html`

The widget automatically picks up changes when the server is restarted.

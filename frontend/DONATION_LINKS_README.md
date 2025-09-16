# Donation Links Feature

This document describes the donation links creation and management functionality implemented in the frontend.

## Overview

The donation links feature allows streamers to create customizable donation pages that their audience can use to support them. Each donation link has:

- Custom title and description
- Unique URL slug
- Theme customization (colors)
- Privacy settings (anonymous donations)
- Active/inactive status

## Features Implemented

### 1. Create Donation Link Page
- **Route**: `/donation-links/create`
- **Component**: `frontend/src/app/donation-links/create/page.tsx`
- **Form Component**: `frontend/src/components/DonationLinkForm.tsx`

### 2. Donation Links Dashboard
- **Route**: `/dashboard/donation-links`
- **Component**: `frontend/src/app/dashboard/donation-links/page.tsx`
- **Features**: View, manage, and edit existing donation links

### 3. API Endpoints
- **POST** `/api/donation-links` - Create new donation link
- **GET** `/api/donation-links` - Fetch user's donation links
- **GET** `/api/donation-links/check-url` - Check URL availability

### 4. Authentication & Authorization
- **Hook**: `frontend/src/lib/useAuth.ts`
- **Access Control**: Only authenticated streamers can create/manage donation links
- **Token Management**: JWT tokens stored in localStorage/sessionStorage

## How to Use

### For Streamers

1. **Navigate to Create Page**
   - Go to `/donation-links/create`
   - Must be logged in as a streamer

2. **Fill Out the Form**
   - **Title**: Clear, descriptive name for your donation page
   - **Description**: Explain why people should support you
   - **Custom URL**: Choose a memorable, unique URL slug
   - **Settings**: Toggle active status and anonymous donations
   - **Theme**: Customize colors to match your brand

3. **Submit and Create**
   - Form validates all inputs
   - Checks URL availability in real-time
   - Creates donation link in backend
   - Redirects to dashboard

### For Developers

1. **Environment Setup**
   ```bash
   # Set backend URL in your environment
   BACKEND_URL=http://localhost:3001
   ```

2. **Authentication Flow**
   - Users must have valid JWT token
   - Token stored in localStorage/sessionStorage
   - API calls include `Authorization: Bearer <token>` header

3. **Component Structure**
   ```
   donation-links/
   ├── create/
   │   └── page.tsx          # Create form page
   ├── layout.tsx            # Layout wrapper
   └── dashboard/
       └── donation-links/
           └── page.tsx      # Management dashboard
   ```

## Technical Details

### Form Features
- **Basic Information**: Title, description, custom URL
- **Settings**: Active status, anonymous donations
- **Theme Customization**: Primary, secondary, background, text colors
- **Live Preview**: Real-time theme preview
- **Validation**: Client-side validation with helpful error messages

### URL Structure
- **Custom URL**: A unique path segment (e.g., "my-stream", "support-me")
- **Final URL**: Your donation page will be available at `/donate/{customUrl}`
- **Examples**: 
  - Custom URL: "gaming-stream" → Final URL: `/donate/gaming-stream`
  - Custom URL: "support-me" → Final URL: `/donate/support-me`

### Form Validation
- **Title**: Required, non-empty
- **Custom URL**: Required, 3+ characters, alphanumeric + hyphens only
- **URL Availability**: Real-time checking against existing links
- **Description**: Optional, max 500 characters

### Theme Customization
- **Primary Color**: Main button and accent colors
- **Secondary Color**: Secondary elements
- **Background Color**: Page background
- **Text Color**: Main text color
- **Live Preview**: Real-time theme preview

### State Management
- **Zustand Store**: `useAppStore` for donation links data
- **Local State**: Form state and validation errors
- **API Integration**: RESTful endpoints with proper error handling

### Error Handling
- **Form Validation**: Client-side validation with helpful error messages
- **API Errors**: Proper error display and user feedback
- **Authentication**: Graceful handling of auth failures

## API Integration

### Backend Requirements
The frontend expects these backend endpoints:

1. **POST** `/api/donation-links`
   ```json
   {
     "title": "string",
     "description": "string?",
     "customUrl": "string",
     "isActive": "boolean",
     "allowAnonymous": "boolean",
     "theme": {
       "primaryColor": "string",
       "secondaryColor": "string",
       "backgroundColor": "string",
       "textColor": "string"
     }
   }
   ```

2. **GET** `/api/donation-links`
   - Returns paginated list of user's donation links
   - Includes pagination metadata

3. **GET** `/api/donation-links/check-url?url=<slug>`
   - Returns `{ available: boolean, message: string }`

### Authentication
- **JWT Tokens**: Bearer token authentication
- **User Profile**: `/api/auth/profile` endpoint for user verification
- **Role-Based Access**: Streamer role required for donation link operations

## Future Enhancements

### Planned Features
- [ ] Edit existing donation links
- [ ] Delete donation links
- [ ] Analytics and performance tracking
- [ ] Bulk operations
- [ ] Template presets
- [ ] Advanced theme options

### Potential Improvements
- [ ] Drag-and-drop theme builder
- [ ] A/B testing for different themes
- [ ] Social media integration
- [ ] QR code generation
- [ ] Mobile app integration

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Check that user has 'streamer' role
   - Verify token is stored in localStorage/sessionStorage

2. **URL Availability Issues**
   - Backend endpoint may not exist yet
   - Fallback checking implemented for development
   - Check browser console for API errors

3. **Form Submission Failures**
   - Validate all required fields are filled
   - Check custom URL format (alphanumeric + hyphens only)
   - Ensure backend is running and accessible

### Development Notes
- Frontend includes fallback logic for missing backend endpoints
- Mock data can be used for testing without backend
- All API calls include proper error handling and user feedback

## Contributing

When adding new features to the donation links system:

1. **Follow Existing Patterns**
   - Use the established component structure
   - Implement proper error handling
   - Add appropriate loading states

2. **Testing Considerations**
   - Test with different user roles
   - Verify form validation works correctly
   - Test API integration and error scenarios

3. **Documentation**
   - Update this README for new features
   - Add inline code comments for complex logic
   - Document any new API requirements 
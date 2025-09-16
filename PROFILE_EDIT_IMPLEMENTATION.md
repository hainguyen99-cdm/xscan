# Profile Edit Implementation

## Overview
This document describes the implementation of the profile editing functionality for the donation platform.

## Features Implemented

### 1. Profile Information Editing
- **Full Name**: Users can edit their first and last name
- **Email Address**: Users can update their email address
- **Bio**: Users can add or edit their personal bio/description
- **Location**: Users can set their location (city, country)
- **Website**: Users can add their personal website URL

### 2. Profile Picture & Cover Photo Upload
- **Avatar Upload**: Users can upload a profile picture (max 5MB)
- **Cover Photo Upload**: Users can upload a cover photo (max 10MB)
- **File Validation**: Only image files are accepted
- **Real-time Upload**: Files are uploaded immediately when selected

### 3. Notification Preferences
- **Email Notifications**: Toggle email notification settings
- **Push Notifications**: Toggle browser push notifications
- **SMS Notifications**: Toggle SMS notification settings

### 4. Privacy Settings
- **Public Profile**: Control profile visibility
- **Show Email**: Control email visibility on public profile
- **Show Location**: Control location visibility on public profile

## Technical Implementation

### Frontend Components
- **Profile Page**: `frontend/src/app/profile/page.tsx`
- **API Route**: `frontend/src/app/api/profile/update/route.ts`
- **Type Definitions**: `frontend/src/types/index.ts`

### Backend Integration
- **Update Endpoint**: `PATCH /api/users/profile/update`
- **File Upload Endpoints**: 
  - `POST /api/users/profile/picture` (avatar)
  - `POST /api/users/profile/cover` (cover photo)

### Data Flow
1. User clicks "Edit Profile" button
2. Form fields become editable
3. User makes changes to profile information
4. User clicks "Save Changes"
5. Frontend sends PATCH request to `/api/profile/update`
6. API route forwards request to backend
7. Backend validates and updates user data
8. Success response updates frontend state
9. User sees success message

### Form Validation
- **Email**: Must be valid email format
- **File Uploads**: Only image files, size limits enforced
- **Required Fields**: Name and email are required
- **URL Validation**: Website field accepts valid URLs

## Usage Instructions

### For Users
1. Navigate to `/profile` page
2. Click the "Edit Profile" button in the Settings tab
3. Make desired changes to your profile information
4. Click "Save Changes" to update your profile
5. Use the upload buttons to change profile picture or cover photo

### For Developers
1. Ensure backend is running on `http://localhost:3001`
2. Ensure frontend is running on `http://localhost:3000`
3. User must be authenticated to access profile editing
4. All API calls require valid JWT token in Authorization header

## API Endpoints

### Update Profile
```
PATCH /api/profile/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "bio": "Personal bio text",
  "location": "New York, NY",
  "website": "https://example.com"
}
```

### Upload Profile Picture
```
POST /api/profile/picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### Upload Cover Photo
```
POST /api/profile/cover
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

## Error Handling
- **Authentication Errors**: Redirects to login page
- **Validation Errors**: Displays error messages to user
- **File Upload Errors**: Shows specific error for file issues
- **Network Errors**: Graceful fallback with user-friendly messages

## Security Features
- **JWT Authentication**: All endpoints require valid token
- **File Type Validation**: Only image files accepted
- **File Size Limits**: Prevents large file uploads
- **Input Sanitization**: Backend validates all input data
- **CSRF Protection**: Built into Next.js API routes

## Future Enhancements
- **Profile Completion Percentage**: Show profile completion status
- **Social Media Links**: Add social media profile links
- **Profile Verification**: Add verification badges
- **Profile Analytics**: Show profile view statistics
- **Advanced Privacy Controls**: More granular privacy settings


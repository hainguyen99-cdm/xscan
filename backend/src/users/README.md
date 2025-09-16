# Users Module

This module handles user management in the XScan application.

## User Model Schema

The User model includes the following fields:

### Required Fields
- `username` (string, 3-50 chars, unique): User's unique username
- `email` (string, unique, lowercase): User's email address
- `password` (string, min 6 chars): Hashed password
- `firstName` (string, 2-50 chars): User's first name
- `lastName` (string, 2-50 chars): User's last name
- `role` (enum: 'user', 'admin', 'moderator'): User's role in the system
- `isActive` (boolean): Whether the user account is active
- `createdAt` (Date): Account creation timestamp
- `updatedAt` (Date): Last update timestamp

### Optional Fields
- `phone` (string): User's phone number (supports international format)
- `address` (string, max 500 chars): User's address
- `profilePicture` (string, max 500 chars): URL to user's profile picture
- `lastLoginAt` (Date): Timestamp of user's last login

## API Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (passwords excluded)
- `GET /api/users/:id` - Get user by ID (password excluded)
- `PATCH /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user account

## Validation

The module uses class-validator decorators for input validation:
- Username: 3-50 characters, unique
- Email: Valid email format, unique, automatically lowercased
- Password: Minimum 6 characters
- First/Last Name: 2-50 characters
- Phone: Optional, supports international format with regex validation
- Address: Optional, maximum 500 characters
- Profile Picture: Optional, maximum 500 characters
- Role: Must be one of: 'user', 'admin', 'moderator'

## Security Features

- Passwords are automatically hashed using bcrypt (salt rounds: 10)
- Passwords are never returned in API responses
- Email addresses are automatically lowercased for consistency
- Username and email uniqueness is enforced at the database level

## Usage Examples

### Creating a User
```typescript
const createUserDto = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securePassword123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-555-123-4567',
  address: '123 Main St, City, State 12345',
  role: 'user'
};

const user = await usersService.create(createUserDto);
```

### Updating Last Login
```typescript
await usersService.updateLastLogin(userId);
```

## Dependencies

- `@nestjs/mongoose` - MongoDB integration
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `class-validator` - Input validation
- `class-transformer` - DTO transformation 
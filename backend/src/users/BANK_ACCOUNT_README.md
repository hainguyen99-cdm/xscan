# Bank Account Management

This module provides comprehensive bank account management functionality for users with streamer or admin roles.

## Features

- **Create Bank Accounts**: Add new bank accounts with bank name, account holder name, and account number
- **Bank Selection**: Integrated with VietQR API to provide a list of Vietnamese banks
- **Account Management**: Edit, delete, and manage multiple bank accounts
- **Default Account**: Set a primary bank account for transactions
- **Soft Delete**: Accounts are marked as inactive rather than permanently deleted
- **Validation**: Prevents duplicate accounts and ensures data integrity

## API Endpoints

### Get User Bank Accounts
```
GET /api/users/bank-accounts
Authorization: Bearer <token>
```

### Create Bank Account
```
POST /api/users/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankName": "Asia Commercial Joint Stock Bank",
  "accountName": "John Doe",
  "accountNumber": "1234567890",
  "bankCode": "ACB",
  "bankShortName": "ACB",
  "isDefault": false
}
```

### Get Specific Bank Account
```
GET /api/users/bank-accounts/:accountId
Authorization: Bearer <token>
```

### Update Bank Account
```
PATCH /api/users/bank-accounts/:accountId
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountName": "Updated Name",
  "isDefault": true
}
```

### Delete Bank Account
```
DELETE /api/users/bank-accounts/:accountId
Authorization: Bearer <token>
```

### Set Default Bank Account
```
PATCH /api/users/bank-accounts/:accountId/set-default
Authorization: Bearer <token>
```

### Get Bank Account Statistics
```
GET /api/users/bank-accounts/stats
Authorization: Bearer <token>
```

## Bank List Integration

The system integrates with the VietQR API to provide a comprehensive list of Vietnamese banks:

```
GET https://api.vietqr.io/v2/banks
```

Response includes:
- Bank ID, name, and code
- BIN (Bank Identification Number)
- Short name and logo
- Transfer and lookup support flags

## Data Model

### BankAccount Schema
```typescript
{
  userId: ObjectId,        // Reference to User
  bankName: string,        // Full bank name
  accountName: string,     // Account holder name
  accountNumber: string,   // Account number
  bankCode?: string,       // Bank code (e.g., "ACB")
  bankShortName?: string,  // Bank short name
  isActive: boolean,       // Account status
  isDefault: boolean,      // Primary account flag
  lastUsedAt?: Date,       // Last transaction date
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **User Isolation**: Users can only access their own bank accounts
- **Input Validation**: Comprehensive validation using class-validator
- **Soft Delete**: Prevents data loss and maintains audit trail

## Business Rules

1. **Unique Constraint**: Only one account per user per bank code + account number combination
2. **Default Account**: Only one account can be marked as default per user
3. **Active Status**: Inactive accounts are excluded from most operations
4. **Bank Integration**: Bank information is automatically populated from VietQR API

## Usage Examples

### Frontend Integration
```typescript
import { 
  getUserBankAccounts, 
  createBankAccount, 
  updateBankAccount 
} from '@/lib/api';

// Get user's bank accounts
const accounts = await getUserBankAccounts();

// Create new account
const newAccount = await createBankAccount({
  bankName: 'Vietcombank',
  accountName: 'John Doe',
  accountNumber: '1234567890',
  bankCode: 'VCB',
  isDefault: true
});
```

### Backend Service Usage
```typescript
@Injectable()
export class PaymentService {
  constructor(private bankAccountService: BankAccountService) {}

  async processWithdrawal(userId: string, amount: number) {
    const defaultAccount = await this.bankAccountService.getDefaultBankAccount(userId);
    if (!defaultAccount) {
      throw new Error('No default bank account configured');
    }
    
    // Process withdrawal logic...
  }
}
```

## Testing

Run the test suite:
```bash
npm run test:unit -- --testPathPattern=bank-account.service.spec.ts
```

## Dependencies

- **NestJS**: Framework for building scalable server-side applications
- **Mongoose**: MongoDB object modeling for Node.js
- **class-validator**: Validation decorators for DTOs
- **class-transformer**: Transformation utilities for DTOs

## Future Enhancements

- **Bank Account Verification**: Integration with bank APIs for account validation
- **Transaction History**: Track bank account usage and transaction history
- **Multi-Currency Support**: Support for different currencies per bank account
- **Bank Account Templates**: Pre-configured templates for common banks
- **Bulk Operations**: Support for importing multiple bank accounts

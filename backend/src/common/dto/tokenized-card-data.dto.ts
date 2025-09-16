import { ApiProperty } from '@nestjs/swagger';

export class TokenizedCardDataDto {
  @ApiProperty({ description: 'The tokenized card identifier' })
  token: string;

  @ApiProperty({ description: 'Last 4 digits of the card for display purposes' })
  last4: string;

  @ApiProperty({ description: 'Card brand (Visa, MasterCard, etc.)' })
  brand: string;

  @ApiProperty({ description: 'Card type (credit, debit, etc.)' })
  type: string;

  @ApiProperty({ description: 'When the token expires' })
  expiresAt: Date;

  @ApiProperty({ description: 'When the token was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Whether the token is still valid' })
  isValid: boolean;
} 
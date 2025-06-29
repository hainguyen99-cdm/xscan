import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const WalletPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Wallet
        </Typography>
        <Typography color="text.secondary">
          Wallet functionality will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default WalletPage; 
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <Typography color="text.secondary">
          Login functionality will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage; 
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        <Typography color="text.secondary">
          Registration functionality will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage; 
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          User dashboard functionality will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default DashboardPage; 
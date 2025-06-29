import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const StreamsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Streams
        </Typography>
        <Typography color="text.secondary">
          Streaming functionality will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default StreamsPage; 
import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to Xscan
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={4}>
            The next-generation streaming and donation platform
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleGetStarted}
            sx={{ px: 4, py: 1.5 }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </Box>

        {/* Features Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          <Card sx={{ width: 300, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Live Streaming
              </Typography>
              <Typography color="text.secondary">
                Stream your content live to your audience with high-quality video and audio.
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ width: 300, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Digital Wallet
              </Typography>
              <Typography color="text.secondary">
                Secure digital wallet integration for seamless transactions and donations.
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ width: 300, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Real-time Donations
              </Typography>
              <Typography color="text.secondary">
                Receive donations from your viewers in real-time during your streams.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage; 
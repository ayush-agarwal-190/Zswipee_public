import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => (
  <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f4f6f8'
  }}>
    <CircularProgress sx={{ mb: 2 }} />
    <Typography variant="h6" color="textSecondary">{message}</Typography>
  </Box>
);

export default LoadingSpinner;
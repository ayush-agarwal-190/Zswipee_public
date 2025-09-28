// ApiKeyTester.jsx (temporary component)
import React, { useState } from 'react';
import { testGroqConnection } from '../services/interviewAPI';
import { Alert, Button, Box, Typography } from '@mui/material';

const ApiKeyTester = () => {
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    const connectionResult = await testGroqConnection();
    setResult(connectionResult);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1, mb: 2 }}>
      <Button variant="outlined" onClick={testConnection}>
        Test GROQ API Connection
      </Button>
      {result && (
        <Alert severity={result.status === 'success' ? 'success' : 'error'} sx={{ mt: 1 }}>
          {result.message}
        </Alert>
      )}
    </Box>
  );
};

export default ApiKeyTester;
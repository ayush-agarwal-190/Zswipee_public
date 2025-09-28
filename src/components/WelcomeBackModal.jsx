import React from 'react';
import { Modal, Box, Typography, Button, Paper } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  p: 4,
  borderRadius: 2,
};

const WelcomeBackModal = ({ open, onClose, onResume }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Paper sx={style}>
                <Typography variant="h6" component="h2">
                    Welcome Back!
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    You have an interview in progress. Would you like to resume where you left off?
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose}>Start Over</Button>
                    <Button variant="contained" onClick={onResume}>Resume Interview</Button>
                </Box>
            </Paper>
        </Modal>
    );
};

export default WelcomeBackModal;
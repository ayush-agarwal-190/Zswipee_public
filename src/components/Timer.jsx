import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const progress = (timeLeft / initialTime) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const getProgressColor = () => {
        if (progress > 50) return 'success';
        if (progress > 25) return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Time Remaining
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </Typography>
            </Box>
            <LinearProgress 
                variant="determinate" 
                value={progress} 
                color={getProgressColor()}
                sx={{ height: 8, borderRadius: 4 }} 
            />
        </Box>
    );
};

export default Timer;
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, Toolbar, Typography, Button, Chip, Box } from '@mui/material';
import { logout } from '../firebase';
import { clearAuth } from '../redux/authSlice';
import { resetInterview } from '../redux/interviewSlice';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Header = () => {
    const dispatch = useDispatch();
    const { user, role } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await logout();
        dispatch(clearAuth());
        dispatch(resetInterview());
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    AI Interview Assistant
                </Typography>
                
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                            label={role === 'interviewer' ? 'Interviewer' : 'Candidate'} 
                            color="secondary" 
                            size="small"
                        />
                        <Typography variant="body2">
                            {user.displayName || user.email}
                        </Typography>
                        <Button 
                            color="inherit" 
                            variant="outlined"
                            startIcon={<ExitToAppIcon />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
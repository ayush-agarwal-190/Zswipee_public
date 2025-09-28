import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './Header';
import { Box, Tabs, Tab, Paper } from '@mui/material';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role } = useSelector(state => state.auth);

    const handleTabChange = (event, newValue) => {
        navigate(newValue);
    };

    // Determine the current tab value based on the route
    let currentTab = location.pathname.startsWith('/interviewer') ? '/interviewer' : '/';
    // Handle the case where an interviewer is viewing a candidate detail page
    if (role === 'interviewer' && location.pathname.includes('/candidate/')) {
        currentTab = '/interviewer';
    }


    return (
        <Box>
            <Header />
            {role === 'interviewer' && (
                <Paper square>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="My Dashboard" value="/interviewer" />
                        <Tab label="Take a Test Interview" value="/" />
                    </Tabs>
                </Paper>
            )}
            <main>
                {children}
            </main>
        </Box>
    );
};

export default Layout;
import React from 'react';
import { useDispatch } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { setUser, setRole } from '../redux/authSlice';
import { Button, Container, Typography, Paper, Grid, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const SignIn = () => {
    const dispatch = useDispatch();

    const handleSignIn = async (signInRole) => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            let finalRole = signInRole;

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    role: signInRole,
                });
            } else {
                finalRole = userDoc.data().role;
            }
            
            dispatch(setRole(finalRole));
            dispatch(setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
            }));

        } catch (error) {
            console.error("Authentication error:", error);
            // You could add a user-facing error message here
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
            <Paper elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    AI Interview Assistant
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
                    Please select your role to sign in.
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<PersonIcon />}
                            onClick={() => handleSignIn('interviewee')}
                            sx={{ py: 1.5 }}
                        >
                            Sign In as Candidate
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                         <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<BusinessCenterIcon />}
                            onClick={() => handleSignIn('interviewer')}
                            sx={{ py: 1.5 }}
                        >
                            Sign In as Interviewer
                        </Button>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GoogleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }}/>
                  <Typography variant="caption" color="textSecondary">
                    Secure sign-in with Google
                  </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignIn;
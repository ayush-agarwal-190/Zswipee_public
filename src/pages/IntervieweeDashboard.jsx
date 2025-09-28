import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { parseResume } from '../utils/resumeParser';
import { setDetails, setStatus, setResumeURL, resetInterview, startInterview, submitAnswer, completeInterview } from '../redux/interviewSlice';
import { generateQuestions, evaluateAnswer, generateSummary, testGroqConnection } from '../services/interviewAPI';
import { store } from '../redux/store';

import Timer from '../components/Timer';
import LoadingSpinner from '../components/LoadingSpinner';
import WelcomeBackModal from '../components/WelcomeBackModal';

import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';

import testEnv from './test-env';
    testEnv();

// Call this in your component
const IntervieweeDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const interview = useSelector((state) => state.interview);
    
    const [localDetails, setLocalDetails] = useState({ name: '', email: '', phone: '' });
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const fileInputRef = useRef(null);
    
    // Test GROQ connection on component mount
    useEffect(() => {
        const testAPI = async () => {
            const result = await testGroqConnection();
            setDebugInfo(`API Status: ${result.status}`);
            console.log("API Test Result:", result);
        };
        testAPI();
    }, []);

    useEffect(() => {
        if (interview.status === 'in-progress' && interview.questions.length > 0) {
            setShowWelcomeModal(true);
        }
    }, []);
    
    useEffect(() => {
        if (interview.status === 'parsing-complete') {
            setLocalDetails(interview.details);
            dispatch(setStatus('confirming-details'));
        }
    }, [interview.status, interview.details, dispatch]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setError('Please upload a PDF or DOCX file.');
            return;
        }

        setError('');
        setResumeFile(file);
        dispatch(setStatus('parsing'));
        
        try {
            const parsedData = await parseResume(file);
            dispatch(setDetails({
                name: parsedData.name || user.displayName || '',
                email: parsedData.email || user.email || '',
                phone: parsedData.phone || '',
            }));
            dispatch(setStatus('parsing-complete'));
        } catch (err) {
            setError("Could not read the resume. Please try another file.");
            dispatch(setStatus('idle'));
        }
    };

    const handleDetailChange = (e) => {
        setLocalDetails({ ...localDetails, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        dispatch(setDetails(localDetails));
        dispatch(setStatus('ready'));
    };
    
    const handleStartInterview = async () => {
        if (!resumeFile && !interview.resumeURL) {
            setError("Please upload your resume to continue.");
            dispatch(resetInterview());
            return;
        }

        dispatch(setStatus('uploading'));
        setError('');

        try {
            let downloadURL = interview.resumeURL;
            
            // Upload new resume if provided
            if (resumeFile) {
                const formData = new FormData();
                formData.append('file', resumeFile);
                formData.append('upload_preset', 'ml_default');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/raw/upload`,
                    { method: 'POST', body: formData }
                );
                
                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();
                downloadURL = data.secure_url;
            }
            
            dispatch(setResumeURL(downloadURL));
            dispatch(setStatus('loading-questions'));
            
            console.log("Generating interview questions...");
            const questions = await generateQuestions();
            console.log("Questions generated:", questions);
            
            dispatch(startInterview(questions));

        } catch (err) {
            console.error("Start interview error:", err);
            setError(`Failed to start interview: ${err.message}`);
            dispatch(setStatus('ready'));
        }
    };
    
    const handleAnswerSubmit = async (answer) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setError('');
        
        const currentQ = interview.questions[interview.currentQuestionIndex];
        console.log("Submitting answer for:", currentQ.question);
        console.log("Answer:", answer);

        try {
            const evaluation = await evaluateAnswer(currentQ.question, answer);
            console.log("Evaluation received:", evaluation);
            
            dispatch(submitAnswer({ 
                index: interview.currentQuestionIndex, 
                answer, 
                evaluation 
            }));
            
            setCurrentAnswer('');
        } catch (err) {
            console.error("Answer submission error:", err);
            setError('Failed to evaluate answer. Please try again.');
            
            // Fallback evaluation
            const fallbackEvaluation = { 
                score: 50, 
                feedback: 'Evaluation system error. Answer recorded for review.' 
            };
            dispatch(submitAnswer({ 
                index: interview.currentQuestionIndex, 
                answer, 
                evaluation: fallbackEvaluation 
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteInterview = async () => {
        dispatch(setStatus('summarizing'));
        setError('');
        
        const finalState = store.getState().interview;
        const totalScore = finalState.evaluations.reduce((acc, curr) => acc + (curr ? curr.score : 0), 0);
        const calculatedScore = finalState.evaluations.length > 0 ? Math.round(totalScore / finalState.evaluations.length) : 0;
        
        console.log("Final state for summary:", finalState);
        
        const interviewData = {
            details: finalState.details,
            resumeURL: finalState.resumeURL,
            transcript: finalState.questions.map((q, i) => ({
                question: q.question,
                difficulty: q.difficulty,
                answer: finalState.answers[i] || 'No answer provided',
                evaluation: finalState.evaluations[i] || { score: 0, feedback: 'Not evaluated' }
            }))
        };

        try {
            console.log("Generating final summary...");
            const summary = await generateSummary({ 
                ...interviewData, 
                finalScore: calculatedScore 
            });
            
            dispatch(completeInterview({ summary, finalScore: calculatedScore }));
            
            // Save to Firebase
            const interviewId = `${user.uid}_${Date.now()}`;
            await setDoc(doc(db, 'interviews', interviewId), {
                ...interviewData,
                finalSummary: summary,
                finalScore: calculatedScore,
                candidateId: user.uid,
                candidateName: finalState.details.name,
                createdAt: new Date(),
            });
            
            console.log("Interview completed and saved successfully");
        } catch (err) {
            console.error("Completion error:", err);
            setError('Failed to generate summary. Interview completed without AI summary.');
            
            const fallbackSummary = `Candidate ${finalState.details.name} completed the interview. Final score: ${calculatedScore}/100. Summary generation failed.`;
            dispatch(completeInterview({ summary: fallbackSummary, finalScore: calculatedScore }));
        }
    };

    useEffect(() => {
        if (interview.status === 'in-progress' && interview.currentQuestionIndex >= interview.questions.length) {
            handleCompleteInterview();
        }
    }, [interview.currentQuestionIndex, interview.status]);

    const renderContent = () => {
        switch (interview.status) {
            case 'idle':
                return (
                    <Box textAlign="center">
                        <PsychologyIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>AI-Powered Interview</Typography>
                        <Typography color="textSecondary" sx={{ mb: 3 }}>
                            Upload your resume to begin your technical interview
                        </Typography>
                        <Button variant="contained" component="label" startIcon={<UploadFileIcon />} size="large">
                            Upload Resume (PDF/DOCX)
                            <input type="file" hidden ref={fileInputRef} accept=".pdf,.docx" onChange={handleFileChange} />
                        </Button>
                        {debugInfo && (
                            <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
                                <CardContent>
                                    <Typography variant="caption">{debugInfo}</Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                );

            case 'confirming-details':
                return (
                    <Box>
                        <Typography variant="h5" gutterBottom align="center">
                            Confirm Your Details
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                            Review and edit the information extracted from your resume
                        </Typography>
                        <Box component="form" onSubmit={handleDetailsSubmit}>
                            <TextField margin="normal" required fullWidth label="Full Name" 
                                name="name" value={localDetails.name} onChange={handleDetailChange} />
                            <TextField margin="normal" required fullWidth label="Email Address" 
                                name="email" value={localDetails.email} onChange={handleDetailChange} />
                            <TextField margin="normal" fullWidth label="Phone Number" 
                                name="phone" value={localDetails.phone} onChange={handleDetailChange} />
                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, py: 1.5 }}>
                                Confirm and Continue
                            </Button>
                        </Box>
                    </Box>
                );

            case 'ready':
                return (
                    <Box textAlign="center">
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>Ready to Start!</Typography>
                        <Typography color="textSecondary" sx={{ mb: 3 }}>
                            Hello, {interview.details.name}! The interview consists of 6 technical questions with timers.
                        </Typography>
                        <Button variant="contained" size="large" onClick={handleStartInterview}>
                            Begin Interview
                        </Button>
                    </Box>
                );

            case 'in-progress':
                const currentQ = interview.questions[interview.currentQuestionIndex];
                if (!currentQ) return <LoadingSpinner message="Loading question..." />;
                
                return (
                    <Box>
                        <Typography variant="caption" color="textSecondary">
                            Question {interview.currentQuestionIndex + 1} of {interview.questions.length} 
                            ({currentQ.difficulty} difficulty)
                        </Typography>
                        <Typography variant="h5" sx={{ my: 2 }}>{currentQ.question}</Typography>
                        
                        <Timer key={interview.currentQuestionIndex} 
                            initialTime={currentQ.timer} 
                            onTimeUp={() => handleAnswerSubmit(currentAnswer)} 
                        />
                        
                        <TextField fullWidth multiline rows={6} variant="outlined" 
                            label="Your Answer" value={currentAnswer} 
                            onChange={(e) => setCurrentAnswer(e.target.value)} 
                            sx={{ mt: 2 }}
                        />
                        
                        <Button variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }} 
                            onClick={() => handleAnswerSubmit(currentAnswer)} 
                            disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Answer'}
                        </Button>
                    </Box>
                );

            case 'completed':
                return (
                    <Box textAlign="center">
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>Interview Complete!</Typography>
                        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
                            Final Score: {interview.finalScore}/100
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 3, textAlign: 'left', bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom>AI Summary:</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {interview.summary}
                            </Typography>
                        </Paper>
                        
                        <Button variant="outlined" sx={{ mt: 3 }} onClick={() => dispatch(resetInterview())}>
                            Start New Interview
                        </Button>
                    </Box>
                );

            default:
                const messages = {
                    'parsing': 'Analyzing your resume...',
                    'uploading': 'Uploading your resume...',
                    'loading-questions': 'Generating interview questions...',
                    'summarizing': 'Generating your evaluation report...',
                };
                return <LoadingSpinner message={messages[interview.status] || "Processing..."} />;
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, minHeight: 'calc(100vh - 64px)' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%', maxWidth: '700px' }}>
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {renderContent()}
            </Paper>
            
            <WelcomeBackModal 
                open={showWelcomeModal} 
                onClose={() => { dispatch(resetInterview()); setShowWelcomeModal(false); }} 
                onResume={() => setShowWelcomeModal(false)} 
            />
        </Box>
    );
};

export default IntervieweeDashboard;
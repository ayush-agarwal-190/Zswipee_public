import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';

const CandidateDetail = () => {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const docRef = doc(db, "interviews", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setInterview(docSnap.data());
                } else {
                    setError('Interview record not found');
                }
            } catch (err) {
                setError('Failed to load interview details');
                console.error('Error fetching interview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [id]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'error';
            default: return 'default';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    if (loading) return <LoadingSpinner />;
    
    if (error || !interview) return (
        <Container sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error || 'Interview not found'}</Alert>
            <Button component={Link} to="/interviewer" startIcon={<ArrowBackIcon />}>
                Back to Dashboard
            </Button>
        </Container>
    );
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button component={Link} to="/interviewer" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
                Back to Dashboard
            </Button>
            
            <Paper sx={{ p: 4 }}>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {interview.candidateName}
                        </Typography>
                        <Typography variant="h6" color="textSecondary">
                            {interview.details?.email}
                        </Typography>
                        <Typography color="textSecondary">
                            {interview.details?.phone || 'No phone provided'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            Interviewed on: {interview.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                        </Typography>
                    </Box>
                    <Chip 
                        label={`Score: ${interview.finalScore}/100`}
                        color={getScoreColor(interview.finalScore)}
                        sx={{ fontSize: '1.2rem', p: 2, fontWeight: 'bold' }}
                    />
                </Box>

                {/* Resume Link */}
                {interview.resumeURL && (
                    <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        href={interview.resumeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mb: 3 }}
                    >
                        View Resume
                    </Button>
                )}

                {/* AI Summary */}
                <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h5">AI Evaluation Summary</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {interview.finalSummary}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Interview Transcript */}
                <Typography variant="h4" sx={{ mb: 3 }}>Detailed Transcript</Typography>
                
                {interview.transcript?.map((item, index) => (
                    <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                                <Typography sx={{ fontWeight: 'bold', flex: 1 }}>
                                    Q{index + 1}: {item.question}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip 
                                        label={item.difficulty} 
                                        color={getDifficultyColor(item.difficulty)} 
                                        size="small" 
                                    />
                                    <Chip 
                                        label={`${item.evaluation?.score || 0}/100`}
                                        color={getScoreColor(item.evaluation?.score || 0)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ backgroundColor: '#f8f9fa' }}>
                            {/* Candidate's Answer */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    CANDIDATE'S ANSWER:
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {item.answer || 'No answer provided.'}
                                    </Typography>
                                </Paper>
                            </Box>

                            {/* AI Feedback */}
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    AI FEEDBACK:
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main', bgcolor: 'white' }}>
                                    <Typography variant="body2" color="primary" gutterBottom>
                                        <strong>Score: {item.evaluation?.score || 'N/A'}/100</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.evaluation?.feedback || 'No feedback available.'}
                                    </Typography>
                                </Paper>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Paper>
        </Container>
    );
};

export default CandidateDetail;
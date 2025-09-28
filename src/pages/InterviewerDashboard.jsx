import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
    Container, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    TextField, 
    Box,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';

const InterviewerDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const q = query(collection(db, "interviews"));
                const querySnapshot = await getDocs(q);
                const interviewsData = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    createdAt: doc.data().createdAt || { seconds: Date.now() / 1000 }
                }));
                setInterviews(interviewsData);
            } catch (error) {
                console.error("Error fetching interviews:", error);
                setError('Failed to load candidate data');
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const sortedAndFilteredInterviews = useMemo(() => {
        return interviews
            .filter(interview =>
                interview.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                interview.details?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                
                switch (sortOrder) {
                    case 'score_desc':
                        return (b.finalScore || 0) - (a.finalScore || 0);
                    case 'score_asc':
                        return (a.finalScore || 0) - (b.finalScore || 0);
                    case 'date_asc':
                        return aTime - bTime;
                    case 'date_desc':
                    default:
                        return bTime - aTime;
                }
            });
    }, [interviews, searchTerm, sortOrder]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getRecommendation = (score) => {
        if (score >= 80) return { label: 'Strong Hire', color: 'success' };
        if (score >= 70) return { label: 'Hire', color: 'success' };
        if (score >= 60) return { label: 'Consider', color: 'warning' };
        return { label: 'Review', color: 'default' };
    };

    if (loading) return <LoadingSpinner message="Loading candidate data..." />;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                    Candidate Evaluations
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    label="Search by Name or Email"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300, flex: 1 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortOrder}
                        label="Sort By"
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <MenuItem value="date_desc">Newest First</MenuItem>
                        <MenuItem value="date_asc">Oldest First</MenuItem>
                        <MenuItem value="score_desc">Score (High to Low)</MenuItem>
                        <MenuItem value="score_asc">Score (Low to High)</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Results Count */}
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Showing {sortedAndFilteredInterviews.length} of {interviews.length} candidates
            </Typography>

            {/* Table */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Candidate</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Submission Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>Final Score</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>Recommendation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedAndFilteredInterviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No candidates found matching your search
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedAndFilteredInterviews.map((interview) => {
                                const recommendation = getRecommendation(interview.finalScore);
                                const interviewDate = interview.createdAt?.seconds 
                                    ? new Date(interview.createdAt.seconds * 1000).toLocaleDateString()
                                    : 'Unknown date';

                                return (
                                    <TableRow
                                        key={interview.id}
                                        hover
                                        onClick={() => navigate(`/interviewer/candidate/${interview.id}`)}
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {interview.candidateName || 'Unnamed Candidate'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {interview.details?.email || 'No email'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {interviewDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={`${interview.finalScore || 0}/100`}
                                                color={getScoreColor(interview.finalScore)}
                                                variant="filled"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={recommendation.label}
                                                color={recommendation.color}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default InterviewerDashboard;
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { setUser, setRole, setLoading, clearAuth } from './redux/authSlice';
import { resetInterview } from './redux/interviewSlice';

import SignIn from './pages/SignIn';
import IntervieweeDashboard from './pages/IntervieweeDashboard';
import InterviewerDashboard from './pages/InterviewerDashboard';
import CandidateDetail from './pages/CandidateDetail';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { user, role, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          dispatch(setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }));
          dispatch(setRole(userDoc.data().role));
        } else {
          dispatch(clearAuth());
          dispatch(resetInterview());
        }
      } else {
        dispatch(clearAuth());
        dispatch(resetInterview());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user) {
      return <Navigate to="/signin" />;
    }
    if (role !== requiredRole) {
      // Redirect to their correct dashboard if they try to access the wrong one
      return <Navigate to={role === 'interviewer' ? '/interviewer' : '/'} />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to={role === 'interviewer' ? '/interviewer' : '/'} />} />
        
        <Route path="/" element={<ProtectedRoute requiredRole="interviewee"><Layout><IntervieweeDashboard /></Layout></ProtectedRoute>} />
        <Route path="/interviewer" element={<ProtectedRoute requiredRole="interviewer"><Layout><InterviewerDashboard /></Layout></ProtectedRoute>} />
        <Route path="/interviewer/candidate/:id" element={<ProtectedRoute requiredRole="interviewer"><Layout><CandidateDetail /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to={user ? (role === 'interviewer' ? '/interviewer' : '/') : "/signin"} />} />
      </Routes>
    </Router>
  );
}

export default App;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // idle, parsing, collecting-name, collecting-email, collecting-phone, ready, uploading, loading-questions, in-progress, summarizing, completed
  status: 'idle',
  details: { name: '', email: '', phone: '' },
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  evaluations: [],
  finalScore: 0,
  summary: '',
  resumeURL: null,
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setDetails: (state, action) => {
      state.details = { ...state.details, ...action.payload };
    },
    setResumeURL: (state, action) => {
        state.resumeURL = action.payload;
    },
    startInterview: (state, action) => {
      state.status = 'in-progress';
      state.questions = action.payload.map(q => ({
        ...q,
        timer: q.difficulty.toLowerCase() === 'easy' ? 20 : q.difficulty.toLowerCase() === 'medium' ? 60 : 120
      }));
      state.answers = Array(action.payload.length).fill('');
      state.evaluations = Array(action.payload.length).fill(null);
      state.currentQuestionIndex = 0;
    },
    submitAnswer: (state, action) => {
      const { index, answer, evaluation } = action.payload;
      state.answers[index] = answer;
      state.evaluations[index] = evaluation;
      if (state.currentQuestionIndex < state.questions.length) {
        state.currentQuestionIndex += 1;
      }
    },
    completeInterview: (state, action) => {
      state.status = 'completed';
      state.summary = action.payload.summary;
      state.finalScore = action.payload.finalScore
    },
    resetInterview: () => initialState,
  },
});

export const { setStatus, setDetails, setResumeURL, startInterview, submitAnswer, completeInterview, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
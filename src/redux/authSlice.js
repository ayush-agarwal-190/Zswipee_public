import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null, // 'interviewee' or 'interviewer'
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.loading = false;
    },
  },
});

export const { setUser, setRole, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
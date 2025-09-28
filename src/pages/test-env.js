// test-env.js
const testEnv = () => {
  console.log('=== ENVIRONMENT VARIABLE TEST ===');
  console.log('REACT_APP_GROQ_API_KEY exists:', !!process.env.REACT_APP_GROQ_API_KEY);
  console.log('REACT_APP_GROQ_API_KEY length:', process.env.REACT_APP_GROQ_API_KEY?.length);
  console.log('REACT_APP_GROQ_API_KEY starts with gsk_:', process.env.REACT_APP_GROQ_API_KEY?.startsWith('gsk_'));
  console.log('First 10 chars:', process.env.REACT_APP_GROQ_API_KEY?.substring(0, 10) + '...');
  console.log('=================================');
};

export default testEnv;
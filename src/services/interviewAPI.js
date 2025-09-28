import Groq from "groq-sdk";

// Enhanced API key validation
const validateApiKey = (key) => {
  if (!key) {
    console.error("❌ GROQ API Key is missing from environment variables");
    return false;
  }
  if (key === "gsk_your_actual_key_here" || key.includes("example") || key.length < 20) {
    console.error("❌ GROQ API Key appears to be a placeholder. Please get a real key from https://console.groq.com");
    return false;
  }
  if (!key.startsWith('gsk_')) {
    console.error("❌ Invalid GROQ API Key format. Should start with 'gsk_'");
    return false;
  }
  console.log("✅ API Key format validated");
  return true;
};

const apiKey = process.env.REACT_APP_GROQ_API_KEY;

// Debug environment variables
console.log("🔍 Environment Check:");
console.log("REACT_APP_GROQ_API_KEY exists:", !!apiKey);
console.log("Key length:", apiKey?.length);
console.log("Key starts with gsk_:", apiKey?.startsWith('gsk_'));

let groq = null;
if (validateApiKey(apiKey)) {
  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });
  console.log("✅ GROQ client initialized successfully");
} else {
  console.warn("⚠️ GROQ client not initialized. Using fallback mode.");
}

// Enhanced connection test
export const testGroqConnection = async () => {
  console.log("🔌 Testing GROQ API connection...");
  
  if (!groq) {
    const errorMsg = 'GROQ client not initialized. Please check your API key in the .env file.';
    console.error("❌", errorMsg);
    return { status: 'error', message: errorMsg };
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'API is working' in JSON format: {'status': 'ok'}" }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
      max_tokens: 50
    });
    
    const result = response.choices[0]?.message?.content;
    console.log("✅ GROQ Connection Successful");
    return { status: 'success', message: 'API is working correctly', data: result };
  } catch (error) {
    const errorMsg = error.message || 'Unknown error occurred';
    console.error("❌ GROQ Connection Failed:", errorMsg);
    return { status: 'error', message: errorMsg };
  }
};

// Enhanced completion function
const getGroqCompletion = async (prompt, isJson = false) => {
  if (!groq) {
    throw new Error('GROQ API key invalid. Please check your .env file and restart the server.');
  }

  const params = {
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
    temperature: 0.3,
    max_tokens: 1024
  };
  
  if (isJson) {
    params.response_format = { type: "json_object" };
  }

  try {
    const completion = await groq.chat.completions.create(params);
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("❌ GROQ API Error:", error.message);
    throw error;
  }
};

// Improved fallback questions with better content
const getFallbackQuestions = () => {
  console.log("🔄 Using high-quality fallback questions");
  return [
    { 
      difficulty: 'Easy', 
      question: 'What is React and what are its main advantages over vanilla JavaScript?',
      timer: 120
    },
    { 
      difficulty: 'Easy', 
      question: 'Explain the difference between let, const, and var in JavaScript with examples.',
      timer: 120
    },
    { 
      difficulty: 'Medium', 
      question: 'How do React hooks work? Explain useState and useEffect with practical examples.',
      timer: 180
    },
    { 
      difficulty: 'Medium', 
      question: 'What is a REST API and how would you handle errors in API calls in a React application?',
      timer: 180
    },
    { 
      difficulty: 'Hard', 
      question: 'What strategies would you use to optimize the performance of a large React application?',
      timer: 240
    },
    { 
      difficulty: 'Hard', 
      question: 'Explain JWT authentication and discuss security best practices for web applications.',
      timer: 240
    }
  ];
};

export const generateQuestions = async () => {
  if (!groq) {
    return getFallbackQuestions();
  }

  try {
    const prompt = `Generate 6 technical interview questions for a React/Node.js developer. Return JSON: {
      "questions": [
        {"difficulty": "Easy", "question": "..."},
        {"difficulty": "Easy", "question": "..."},
        {"difficulty": "Medium", "question": "..."},
        {"difficulty": "Medium", "question": "..."},
        {"difficulty": "Hard", "question": "..."},
        {"difficulty": "Hard", "question": "..."}
      ]
    }`;

    const responseText = await getGroqCompletion(prompt, true);
    const responseJson = JSON.parse(responseText);
    
    if (responseJson.questions) {
      return responseJson.questions.map(q => ({
        ...q,
        timer: q.difficulty === 'Easy' ? 120 : q.difficulty === 'Medium' ? 180 : 240
      }));
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error("❌ AI Question Generation Failed, using fallback");
    return getFallbackQuestions();
  }
};

// Much smarter fallback evaluation system
const getFallbackEvaluation = (question, answer) => {
  console.log("🔄 Using intelligent fallback evaluation");
  
  if (!answer || answer.trim().length === 0) {
    return { 
      score: 0, 
      feedback: 'No answer provided. Please try to answer the question to receive a proper evaluation.' 
    };
  }

  // Remove repeated characters and check actual content
  const cleanAnswer = answer.replace(/(.)\1{3,}/g, '$1$1$1'); // Limit repeated chars
  const wordCount = cleanAnswer.split(/\s+/).filter(word => word.length > 1).length;
  const charCount = cleanAnswer.replace(/\s/g, '').length;

  // Detect non-serious answers (repeated characters, very short)
  if (charCount > 0 && wordCount === 0 && /(.)\1{5,}/.test(answer)) {
    return { 
      score: 5, 
      feedback: 'The answer appears to be placeholder text. Please provide a meaningful response to demonstrate your knowledge.' 
    };
  }

  // Score based on answer quality indicators
  let score = 0;
  let feedback = '';

  if (wordCount > 100) {
    score = 75;
    feedback = 'Detailed answer provided. The length suggests good understanding, but technical accuracy requires AI evaluation.';
  } else if (wordCount > 50) {
    score = 60;
    feedback = 'Substantial answer with good content length. Manual review recommended for technical assessment.';
  } else if (wordCount > 20) {
    score = 40;
    feedback = 'Brief answer provided. Consider expanding with more details and examples for better evaluation.';
  } else if (wordCount > 5) {
    score = 25;
    feedback = 'Very short answer. Please provide more detailed explanations to demonstrate your knowledge.';
  } else {
    score = 10;
    feedback = 'Minimal response. Try to write complete sentences with specific examples.';
  }

  // Adjust score based on question difficulty detection
  const questionLower = question.toLowerCase();
  if (questionLower.includes('explain') || questionLower.includes('how would') || questionLower.includes('optimize')) {
    // Harder questions expect longer answers
    if (wordCount < 30) score = Math.max(0, score - 15);
  }

  return { score: Math.round(score), feedback };
};

export const evaluateAnswer = async (question, answer) => {
  if (!groq) {
    return getFallbackEvaluation(question, answer);
  }

  try {
    const prompt = `Evaluate this technical answer. Return JSON: {"score": number, "feedback": "string"}
    Question: "${question}"
    Answer: "${answer || 'No answer'}"
    
    Score 0-100 based on technical accuracy and completeness. Provide constructive feedback.`;

    const responseText = await getGroqCompletion(prompt, true);
    const evaluation = JSON.parse(responseText);
    
    if (typeof evaluation.score === 'number' && evaluation.feedback) {
      evaluation.score = Math.max(0, Math.min(100, Math.round(evaluation.score)));
      return evaluation;
    }
    throw new Error('Invalid evaluation format');
  } catch (error) {
    console.error("❌ AI Evaluation Failed, using fallback");
    return getFallbackEvaluation(question, answer);
  }
};

// Much better fallback summary
const generateFallbackSummary = (interviewData) => {
  const candidateName = interviewData.details?.name || 'The candidate';
  const finalScore = interviewData.finalScore || 0;
  const transcript = interviewData.transcript || [];
  
  // Calculate statistics
  const scores = transcript.map(item => item.evaluation?.score || 0).filter(score => score > 0);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const answeredQuestions = transcript.filter(item => item.answer && item.answer.trim().length > 10).length;
  
  // Performance analysis
  let performance = 'insufficient data';
  if (scores.length > 0) {
    if (averageScore >= 70) performance = 'strong';
    else if (averageScore >= 50) performance = 'moderate';
    else performance = 'needs improvement';
  }

  return `INTERVIEW SUMMARY: ${candidateName}

Overall Score: ${finalScore}/100
Questions Answered: ${answeredQuestions}/${transcript.length}
Average Question Score: ${averageScore.toFixed(1)}/100
Performance Level: ${performance}

EVALUATION:
${finalScore >= 70 ? 'The candidate demonstrated good technical knowledge across various topics.' :
  finalScore >= 50 ? 'The candidate showed basic understanding but would benefit from additional experience.' :
  'The candidate would benefit from further study and practice in technical concepts.'}

RECOMMENDATION:
${finalScore >= 70 ? '✅ Consider for next interview round' :
  finalScore >= 50 ? '⚠️ Review with additional technical screening' :
  '🔍 Recommend further training and re-assessment'}

Note: This evaluation uses fallback scoring due to AI system unavailability. For detailed technical assessment, please review individual question responses.`;
};

export const generateSummary = async (interviewData) => {
  if (!groq) {
    return generateFallbackSummary(interviewData);
  }

  try {
    const candidateName = interviewData.details?.name || 'The candidate';
    const finalScore = interviewData.finalScore || 0;
    
    const transcriptSummary = interviewData.transcript?.map((item, index) => 
      `Q${index + 1} (${item.difficulty}): ${item.question}\nAnswer: ${item.answer || 'No answer'}\nScore: ${item.evaluation?.score || 0}/100`
    ).join('\n\n');

    const prompt = `Create a professional interview summary for ${candidateName} (Score: ${finalScore}/100):

${transcriptSummary}

Provide a comprehensive 4-paragraph summary covering technical knowledge, strengths, areas for improvement, and hiring recommendation.`;

    return await getGroqCompletion(prompt, false);
  } catch (error) {
    console.error("❌ AI Summary Failed, using fallback");
    return generateFallbackSummary(interviewData);
  }
};
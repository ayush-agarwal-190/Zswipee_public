# 📘 AI Interview App – Documentation  

Welcome to the **AI Interview App** 🚀  
This application helps users **practice interviews with AI-generated questions and answers**, while providing seamless authentication and resume storage.  

🔗 **Live Demo**: [AI Interview App](https://zwipee-public-version-hrc9.vercel.app/signin)  
📺 **Assignment Video (Unlisted)**: [Watch on YouTube](https://youtu.be/)  

---

## 🛠️ Tech Stack Used  

- **React.js** → Frontend framework  
- **Firebase** → Authentication & User Management  
- **Cloudinary** → Resume (PDF) storage  
- **Groq API** → AI-based question generation & answer validation  
- **Gemini API (Google Generative AI)** → Enhancing AI-powered responses  
- **Redux Toolkit** → State management  
- **Framer Motion** → Smooth UI animations  
- **MUI (Material UI)** → UI components  

---

## ⚙️ Project Setup  

### 1️⃣ Clone the Repository  

```bash
git clone <your-repo-link>
cd ai-interview-app
```

---

### 2️⃣ Install Dependencies  

Make sure you have **Node.js** installed. Then run:  

```bash
npm install
```

This will install all the dependencies from `package.json`, including:  

- `firebase`
- `@mui/material`
- `@reduxjs/toolkit`
- `framer-motion`
- `groq-sdk`
- `@google/generative-ai`
- `react-pdf`
- `mammoth`
- and more (see full list in `package.json`)  

---

### 3️⃣ Environment Variables Setup  

The app requires several **API keys** to function properly.  
You must create **two `.env` files**:  

✅ `.env` → Inside the **main project root**  
✅ `.env` → Inside the **src/ folder**  

⚠️ **Important:** Both files must have the same keys.  

#### Example `.env` file content:  

```env
# Firebase Config
REACT_APP_FIREBASE_API_KEY=""
REACT_APP_FIREBASE_AUTH_DOMAIN=""
REACT_APP_FIREBASE_PROJECT_ID=""
REACT_APP_FIREBASE_STORAGE_BUCKET=""
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=""
REACT_APP_FIREBASE_APP_ID=""
REACT_APP_FIREBASE_MEASUREMENT_ID=""

# Gemini API (Google Generative AI)
REACT_APP_GEMINI_API_KEY=""

# Cloudinary (Resume Storage)
REACT_APP_CLOUDINARY_CLOUD_NAME=""

# Groq API (AI Interview Q&A)
REACT_APP_GROQ_API_KEY=""
```

👉 Replace the empty strings `""` with your **actual API keys**.  

---

### 4️⃣ Start the Development Server  

```bash
npm start
```

This will start your app at:  
👉 [http://localhost:3000](http://localhost:3000)  

---

## 📂 Features  

- 🔐 **Secure Login/Signup** → Using Firebase Authentication  
- 📄 **Upload Resume** → Store resumes as PDF files on Cloudinary  
- 🤖 **AI-Powered Interviews** → Groq API generates questions & validates answers  
- 🧠 **Gemini API** → Provides smart AI responses for better user experience  
- 🎨 **Modern UI** → Built with Material UI & Framer Motion animations  

---

## 📌 Notes  

- Ensure both `.env` files (main folder & `src/`) are updated with the same API keys.  
- If any library fails to install, try running:  

```bash
npm install --legacy-peer-deps
```

---

✅ Now you’re ready to run the **AI Interview App**!  

# 🎯 Interview AI — AI-Powered Interview Preparation Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://interview-aj80ezhm7-varuns-projects-05a00148.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Varunmalewar/Interview-AI)

An end-to-end full-stack web application that leverages **Google Gemini Generative AI** to analyze your resume and target job descriptions, generating tailored interview strategies, technical/behavioral question banks, skill gap analyses, day-wise roadmaps, and ATS-optimized tailored resumes — and then takes you from preparation to practice with an **AI-driven mock interview module** (timed & voice modes), instant answer evaluation with smart follow-ups, and a progress dashboard that tracks your readiness over time.

🔗 **Live Application URL**: [https://interview-aj80ezhm7-varuns-projects-05a00148.vercel.app/](https://interview-aj80ezhm7-varuns-projects-05a00148.vercel.app/)

---

## ✨ Key Features

- **📊 Smart Profile Match Scoring**
  - Instant candidate-to-job match score calculation (0–100%).
  - Highlights compatibility and readiness for the target role.

- **🎯 Targeted Technical & Behavioral Question Banks**
  - Curated technical questions based on the candidate's exact tech stack and JD requirements.
  - Deep behavioral questions accompanied by interviewer intent and model answers.

- **🔍 Skill Gap Analysis**
  - Identifies missing or weak skills with severity indicators (`Low`, `Medium`, `High`).

- **🗓️ Day-Wise Preparation Road Map**
  - Structured, actionable preparation schedule broken down by daily focus and tasks.

- **📄 ATS-Friendly Tailored Resume PDF Generation**
  - Uses AI and **Puppeteer** to generate and download a clean, ATS-optimized resume tailored specifically to the job description.

- **🎤 AI-Driven Mock Interview (Timed & Voice Modes)**
  - Practice real questions from your report in a full-screen mock interview session.
  - **Timed mode**: answer each question against a countdown timer with auto-submit.
  - **Voice mode**: record your spoken answer with the mic; **Gemini audio input** transcribes it verbatim for evaluation.

- **📝 Instant Answer Evaluation & Smart Follow-ups**
  - Every practice answer is scored (0–100) against the model answer.
  - Get concise feedback, key-point coverage, 2–3 improvement tips, and smart follow-up questions that probe exactly what you missed.

- **📊 Practice Progress & Readiness Dashboard**
  - Aggregates every practice/voice/timed attempt into per-report readiness scores.
  - Tracks average scores by section (technical/behavioral), a 14-day score history, practice streak, and improvement on repeated questions.

- **🔒 Secure Authentication & Route Protection**
  - JWT-based authentication stored in secure HttpOnly cookies.
  - Protected frontend route guards and custom auth hooks.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Styling**: SCSS (Modern Dart Sass `@use "sass:color"`)
- **State Management**: React Context API (`AuthProvider`, `InterviewProvider`)
- **HTTP Client**: Axios (with credentials)
- **UI Kit**: Reusable components (`Button`, `Card`, `Tabs`, `Toast`, `Dropzone`, `Accordion`, …) with `lucide-react` icons
- **Media Recording**: Web `MediaRecorder` API (`useMediaRecorder` hook) for voice answers

### Backend
- **Runtime**: Node.js + Express 5
- **Database**: MongoDB + Mongoose ODM
- **AI Integration**: `@google/genai` (Google Gemini API — text generation & audio transcription)
- **PDF Processing**: `pdf-parse` v2 (Resume extraction) & `puppeteer` (Resume PDF generation)
- **File Upload**: Multer (Memory storage — files & audio)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`

---

## 📁 Project Architecture

```
GenAi/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Auth, interview report & practice controllers
│   │   ├── middlewares/      # Auth guard & Multer (file + audio) upload middleware
│   │   ├── models/           # Mongoose schemas (User, InterviewReport, PracticeAttempt)
│   │   ├── routes/           # Express API route endpoints
│   │   └── services/         # Gemini AI (report, evaluation, transcription) & Puppeteer PDF services
│   ├── .env.example          # Template environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Server entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Navbar & reusable UI kit (Button, Card, Tabs, Toast, …)
│   │   ├── features/
│   │   │   ├── auth/         # Login, Register, AuthContext, Protected routes
│   │   │   └── interview/    # Home (plan generator), Interview (report view), MockInterview, ProgressPanel
│   │   ├── styles/           # Global SCSS styles & variables
│   │   ├── app.routes.jsx    # Client-side router configuration
│   │   └── main.jsx          # React app entry point
│   ├── .env.example          # Template environment variables (VITE_API_URL)
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore                # Root gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Google AI Studio API Key** ([Get your API Key](https://aistudio.google.com/))

---

### 1. Clone the Repository

```bash
git clone https://github.com/Varunmalewar/Interview-AI.git
cd Interview-AI
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview-master
   JWT_SECRET=your_super_secret_jwt_key
   GOOGLE_AI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173   # Frontend origin for CORS (defaults to this)
   # COOKIE_SAMESITE=none             # Uncomment for cross-site HTTPS deployments (e.g. Vercel frontend + separate API host)
   # COOKIE_SECURE=true               # Defaults to true when NODE_ENV=production
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:3000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `Frontend/.env` to point at a deployed API in production:
   ```env
   VITE_API_URL=https://your-api-host
   ```
   *In development this is not needed — the Vite dev server proxies `/api/*` to `http://localhost:3000` automatically (see `vite.config.js`).*

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive auth cookie | Public |
| `GET` | `/api/auth/logout` | Clear auth cookie | Private |
| `GET` | `/api/auth/get-me` | Get currently logged-in user profile | Private |

### Interview & AI (`/api/interview`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/interview/` | Generate interview report (Upload resume PDF / JD) | Private |
| `GET` | `/api/interview/` | Get all generated reports for the current user | Private |
| `GET` | `/api/interview/report/:interviewId` | Get detailed interview report by ID | Private |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generate & download tailored ATS Resume PDF | Private |
| `POST` | `/api/interview/evaluate` | Evaluate an answer against the model answer (score, feedback, follow-ups) | Private |
| `POST` | `/api/interview/transcribe` | Transcribe a spoken answer (WAV upload) via Gemini audio input | Private |
| `GET` | `/api/interview/practice/stats` | Aggregated practice stats & readiness for the Progress dashboard | Private |
| `GET` | `/api/interview/practice/attempts` | Recent practice attempts (filter by report/section/mode) | Private |

---

## 🔒 Security Best Practices
- **No Secrets in Source Control**: All sensitive keys and database URLs are managed through `.env` and strictly ignored via `.gitignore`.
- **HttpOnly Cookies**: Prevents client-side XSS access to auth tokens.
- **Input Sanitization & Schema Validation**: Strict schema formatting for GenAI outputs.

---

## 📄 License
This project is licensed under the ISC License.

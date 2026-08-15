# 🎯 Interview AI — AI-Powered Interview Preparation Platform

[![Live Demo](https://interview-ai-phi-one.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Varunmalewar/Interview-AI)

An end-to-end full-stack web application that leverages **Google Gemini Generative AI** to analyze your resume and target job descriptions, generating tailored interview strategies, technical/behavioral question banks, skill gap analyses, day-wise roadmaps, and ATS-optimized tailored resumes.

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

### Backend
- **Runtime**: Node.js + Express 5
- **Database**: MongoDB + Mongoose ODM
- **AI Integration**: `@google/genai` (Google Gemini API)
- **PDF Processing**: `pdf-parse` v2 (Resume extraction) & `puppeteer` (Resume PDF generation)
- **File Upload**: Multer (Memory storage)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`

---

## 📁 Project Architecture

```
GenAi/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Auth & interview report controllers
│   │   ├── middlewares/      # Auth guard & Multer file upload middleware
│   │   ├── models/           # Mongoose schemas (User, InterviewReport)
│   │   ├── routes/           # Express API route endpoints
│   │   └── services/         # Gemini AI & Puppeteer PDF services
│   ├── .env.example          # Template environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Server entry point
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/         # Login, Register, AuthContext, Protected routes
│   │   │   └── interview/    # Home (plan generator), Interview (report view)
│   │   ├── styles/           # Global SCSS styles & variables
│   │   ├── app.routes.jsx    # Client-side router configuration
│   │   └── main.jsx          # React app entry point
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

3. Start the frontend development server:
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

---

## 🔒 Security Best Practices
- **No Secrets in Source Control**: All sensitive keys and database URLs are managed through `.env` and strictly ignored via `.gitignore`.
- **HttpOnly Cookies**: Prevents client-side XSS access to auth tokens.
- **Input Sanitization & Schema Validation**: Strict schema formatting for GenAI outputs.

---

## 📄 License
This project is licensed under the ISC License.

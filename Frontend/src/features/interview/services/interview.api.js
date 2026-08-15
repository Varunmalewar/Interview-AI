import axios from "axios";

// Dev: the Vite dev server proxies /api/* to the backend (see vite.config.js),
// so calls are same-origin — no CORS, cookies just work.
// Production: build with VITE_API_URL=https://your-api-host to point at the API.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/",
    withCredentials: true,
})


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data

}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}


/**
 * @description Service to evaluate a user's answer to an interview question against the model answer.
 *              Every evaluation is persisted as a PracticeAttempt (backend) so the Progress
 *              dashboard can aggregate it. mode/reportId/section/sourceQuestion are optional
 *              metadata for that attempt.
 */
export const evaluateAnswer = async ({ question, intention, modelAnswer, userAnswer, mode = 'practice', reportId, section, sourceQuestion }) => {
    const response = await api.post("/api/interview/evaluate", {
        question,
        intention,
        modelAnswer,
        userAnswer,
        mode,
        reportId,
        section,
        sourceQuestion
    })

    return response.data
}


/**
 * @description Service to transcribe a recorded voice answer (audio/wav blob) to text.
 *              The audio bytes go to the backend, which forwards them to Gemini —
 *              the API key stays server-side.
 */
export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.wav")

    const response = await api.post("/api/interview/transcribe", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}


/**
 * @description Service to fetch aggregated practice stats for the Progress
 *              dashboard. Scoped to one report when reportId is provided,
 *              otherwise across all of the user's attempts.
 */
export const getPracticeStats = async ({ reportId } = {}) => {
    const response = await api.get("/api/interview/practice/stats", {
        params: reportId ? { report: reportId } : {}
    })

    return response.data
}


/**
 * @description Service to fetch recent practice attempts (newest first).
 */
export const getPracticeAttempts = async ({ reportId, section, mode, limit } = {}) => {
    const response = await api.get("/api/interview/practice/attempts", {
        params: {
            ...(reportId ? { report: reportId } : {}),
            ...(section ? { section } : {}),
            ...(mode ? { mode } : {}),
            ...(limit ? { limit } : {})
        }
    })

    return response.data
}
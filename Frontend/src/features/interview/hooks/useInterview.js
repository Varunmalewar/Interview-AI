import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, evaluateAnswer, transcribeAudio, getPracticeStats as fetchPracticeStats, getPracticeAttempts as fetchPracticeAttempts } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../Interviewcontext.jsx"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.data)
            return response.data
        } catch (error) {
            console.error("Generate report error:", error)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.data)
            return response.data
        } catch (error) {
            console.error("Get report error:", error)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.data)
            return response.data
        } catch (error) {
            console.error("Get reports error:", error)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReports ])

    const getResumePdf = useCallback(async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.error("Generate resume PDF error:", error)
        } finally {
            setLoading(false)
        }
    }, [ setLoading ])

    // Deliberately does NOT set global loading — the practice panel manages its
    // own submitting state so the page stays interactive while Gemini scores.
    const evaluateAnswerResponse = useCallback(async (payload) => {
        try {
            const response = await evaluateAnswer(payload)
            return response.data
        } catch (error) {
            console.error("Evaluate answer error:", error)
            throw error
        }
    }, [])

    // Same non-blocking pattern: the mock-interview modal owns its transcription
    // state while the audio is being sent to Gemini.
    const transcribeAnswer = useCallback(async (audioBlob) => {
        try {
            const response = await transcribeAudio(audioBlob)
            return response.data
        } catch (error) {
            console.error("Transcribe answer error:", error)
            throw error
        }
    }, [])

    // Non-blocking like the above — the Progress panel renders its own
    // loading/empty states rather than flipping the whole page to a spinner.
    const getPracticeStats = useCallback(async ({ reportId } = {}) => {
        try {
            const response = await fetchPracticeStats({ reportId })
            return response.data
        } catch (error) {
            console.error("Get practice stats error:", error)
            throw error
        }
    }, [])

    const getPracticeAttempts = useCallback(async ({ reportId, section, mode, limit } = {}) => {
        try {
            const response = await fetchPracticeAttempts({ reportId, section, mode, limit })
            return response.data
        } catch (error) {
            console.error("Get practice attempts error:", error)
            throw error
        }
    }, [])

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, evaluateAnswerResponse, transcribeAnswer, getPracticeStats, getPracticeAttempts }

}

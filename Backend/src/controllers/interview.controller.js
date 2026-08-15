const { PDFParse } = require("pdf-parse")
const {generateinterviewreport, generateResumePdf, evaluateAnswer, transcribeAudio} = require("../services/ai.service")
const InterviewReportModel = require("../models/interview.report.model.js")
const PracticeAttemptModel = require("../models/practice.attempt.model.js")


/**
 * @name generateInterViewReportController
 * @desc Generate a new interview report using AI based on resume, self description and job description
 */
async function generateInterViewReportController(req, res) {
    try {
        const resumeFile = req.file
        const {selfDescription, jobDescription} = req.body

        let resumeText = ""
        if (resumeFile) {
            const parser = new PDFParse({ data: resumeFile.buffer })
            const pdfData = await parser.getText()
            resumeText = pdfData.text || ""
        }

        const interviewReportByAI = await generateinterviewreport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await InterviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAI
        })

        res.status(201).json({
            success: true,
            message: "Interview Report generated successfully",
            data: interviewReport
        })
    } catch (error) {
        console.error("Error generating interview report:", error)
        res.status(500).json({
            success: false,
            message: "Failed to generate interview report",
            error: error.message
        })
    }
}


/**
 * @name getInterviewReportByIdController
 * @desc Get a single interview report by its ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const {interviewId} = req.params
        const interviewReport = await InterviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            })
        }

        res.status(200).json({
            success: true,
            data: interviewReport
        })
    } catch (error) {
        console.error("Error fetching interview report:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview report",
            error: error.message
        })
    }
}


/**
 * @name getAllInterviewReportsController
 * @desc Get all interview reports for the logged-in user
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await InterviewReportModel.find({
            user: req.user.id
        }).sort({createdAt: -1})

        // Attach a practice readiness score to each report so the Home cards can
        // show it without N+1 fetches: one aggregate over the user's attempts,
        // blended with the report's match score (same formula as /practice/stats).
        let readinessByReport = {}
        if (interviewReports.length) {
            const grouped = await PracticeAttemptModel.aggregate([
                { $match: { user: req.user.id, report: { $in: interviewReports.map((r) => r._id) }, score: { $gte: 0 } } },
                { $group: { _id: "$report", avgScore: { $avg: "$score" } } }
            ])
            readinessByReport = Object.fromEntries(grouped.map((g) => [String(g._id), Math.round(g.avgScore)]))
        }

        const data = interviewReports.map((report) => {
            const doc = report.toObject()
            const practiceAvg = readinessByReport[String(report._id)]
            if (practiceAvg != null) {
                doc.readiness = report.matchScore != null
                    ? Math.round(practiceAvg * 0.6 + report.matchScore * 0.4)
                    : practiceAvg
            }
            return doc
        })

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        console.error("Error fetching interview reports:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch interview reports",
            error: error.message
        })
    }
}


/**
 * @name generateResumePdfController
 * @desc Generate a tailored resume PDF based on an existing interview report
 */
async function generateResumePdfController(req, res) {
    try {
        const {interviewReportId} = req.params
        const interviewReport = await InterviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            })
        }

        const pdfBuffer = await generateResumePdf({
            resume: interviewReport.resume,
            selfDescription: interviewReport.selfDescription,
            jobDescription: interviewReport.jobDescription
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("Error generating resume PDF:", error)
        res.status(500).json({
            success: false,
            message: "Failed to generate resume PDF",
            error: error.message
        })
    }
}


/**
 * @name evaluateAnswerController
 * @desc Evaluate a user's answer to an interview question against the model answer
 *       and persist the attempt so the Progress dashboard can aggregate it.
 */
async function evaluateAnswerController(req, res) {
    try {
        const {question, intention, modelAnswer, userAnswer, mode, reportId, section, sourceQuestion} = req.body

        if (!question || !modelAnswer || !userAnswer) {
            return res.status(400).json({
                success: false,
                message: "question, modelAnswer and userAnswer are required"
            })
        }

        const evaluation = await evaluateAnswer({
            question,
            intention: intention || "",
            modelAnswer,
            userAnswer
        })

        const attempt = await PracticeAttemptModel.create({
            user: req.user.id,
            report: reportId || null,
            section: section === "behavioral" ? "behavioral" : "technical",
            mode: ["practice", "voice", "timed"].includes(mode) ? mode : "practice",
            question,
            modelAnswer,
            userAnswer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            keyPoints: evaluation.keyPoints || [],
            tips: evaluation.tips || [],
            followUps: evaluation.followUps || [],
            sourceQuestion: sourceQuestion || ""
        })

        res.status(200).json({
            success: true,
            message: "Answer evaluated successfully",
            data: {
                ...evaluation,
                attemptId: attempt._id
            }
        })
    } catch (error) {
        console.error("Error evaluating answer:", error)
        res.status(500).json({
            success: false,
            message: "Failed to evaluate answer",
            error: error.message
        })
    }
}


/**
 * @name transcribeAudioController
 * @desc Transcribe a spoken answer (WAV upload) into text using Gemini audio input.
 */
async function transcribeAudioController(req, res) {
    try {
        const audioFile = req.file

        if (!audioFile) {
            return res.status(400).json({
                success: false,
                message: "audio file is required"
            })
        }

        if (!audioFile.mimetype || !audioFile.mimetype.startsWith("audio/")) {
            return res.status(400).json({
                success: false,
                message: "audio file must be a valid audio file"
            })
        }

        const audioBase64 = audioFile.buffer.toString("base64")
        const transcription = await transcribeAudio({
            audioBase64,
            mimeType: audioFile.mimetype || "audio/wav"
        })

        res.status(200).json({
            success: true,
            message: "Audio transcribed successfully",
            data: {
                transcript: transcription.transcript || ""
            }
        })
    } catch (error) {
        console.error("Error transcribing audio:", error)
        res.status(500).json({
            success: false,
            message: "Failed to transcribe audio",
            error: error.message
        })
    }
}


/**
 * @name practiceStatsController
 * @desc Aggregate practice attempts for the Progress dashboard: readiness score,
 *       averages, score history, streak, and improvement on repeated questions.
 */
async function practiceStatsController(req, res) {
    try {
        const {report} = req.query
        const userId = req.user.id

        const match = {user: userId}
        if (report) match.report = report

        const attempts = await PracticeAttemptModel.find(match).sort({createdAt: 1}).select("score section mode question createdAt")

        const totalAttempts = attempts.length

        // ── Per-day aggregation (local calendar day of the attempt) ──────────
        const dayIndex = new Map() // "YYYY-MM-DD" -> { sum, count }
        const dayKeys = new Set()
        for (const a of attempts) {
            const key = a.createdAt.toISOString().slice(0, 10)
            dayKeys.add(key)
            const entry = dayIndex.get(key) || {sum: 0, count: 0}
            entry.sum += a.score
            entry.count += 1
            dayIndex.set(key, entry)
        }

        // Score history for the last 14 days (missing days → null)
        const scoreHistory = []
        for (let i = 13; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000)
            const key = d.toISOString().slice(0, 10)
            const entry = dayIndex.get(key)
            scoreHistory.push({
                date: key,
                average: entry ? Math.round(entry.sum / entry.count) : null
            })
        }

        // ── Streak: consecutive days (ending today or yesterday) with attempts ─
        let streak = 0
        let cursor = new Date()
        if (!dayKeys.has(cursor.toISOString().slice(0, 10))) {
            cursor = new Date(Date.now() - 86400000) // allow streak ending yesterday
        }
        while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
            streak += 1
            cursor = new Date(cursor.getTime() - 86400000)
        }

        // ── Improvement on repeated questions (latest − first score) ──────────
        const byQuestion = new Map()
        for (const a of attempts) {
            const list = byQuestion.get(a.question) || []
            list.push(a.score)
            byQuestion.set(a.question, list)
        }
        const improvement = []
        for (const [question, scores] of byQuestion.entries()) {
            if (scores.length >= 2) {
                improvement.push({
                    question,
                    attempts: scores.length,
                    firstScore: scores[0],
                    latestScore: scores[scores.length - 1],
                    delta: scores[scores.length - 1] - scores[0]
                })
            }
        }
        improvement.sort((x, y) => y.delta - x.delta)

        const avgScore = totalAttempts ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0

        const avgScoreBySection = {}
        for (const section of ["technical", "behavioral"]) {
            const list = attempts.filter((a) => a.section === section)
            avgScoreBySection[section] = list.length
                ? Math.round(list.reduce((sum, a) => sum + a.score, 0) / list.length)
                : null
        }

        const attemptsByMode = {}
        for (const mode of ["practice", "voice", "timed"]) {
            attemptsByMode[mode] = attempts.filter((a) => a.mode === mode).length
        }

        // Readiness: blend practice average with the report's match score when scoped
        let readiness = avgScore
        if (report) {
            const reportDoc = await InterviewReportModel.findOne({_id: report, user: userId}).select("matchScore")
            if (reportDoc && reportDoc.matchScore != null) {
                readiness = Math.round(avgScore * 0.6 + reportDoc.matchScore * 0.4)
            }
        }

        res.status(200).json({
            success: true,
            message: "Practice stats fetched successfully",
            data: {
                totalAttempts,
                avgScore,
                avgScoreBySection,
                attemptsByMode,
                scoreHistory,
                streak,
                improvement,
                readiness
            }
        })
    } catch (error) {
        console.error("Error fetching practice stats:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch practice stats",
            error: error.message
        })
    }
}


/**
 * @name practiceAttemptsController
 * @desc List recent practice attempts for the logged-in user.
 */
async function practiceAttemptsController(req, res) {
    try {
        const {report, section, mode, limit = 50} = req.query
        const userId = req.user.id

        const match = {user: userId}
        if (report) match.report = report
        if (section) match.section = section
        if (mode) match.mode = mode

        const attempts = await PracticeAttemptModel.find(match)
            .sort({createdAt: -1})
            .limit(Math.min(parseInt(limit, 10) || 50, 100))
            .select("-user -modelAnswer")

        res.status(200).json({
            success: true,
            message: "Practice attempts fetched successfully",
            data: attempts
        })
    } catch (error) {
        console.error("Error fetching practice attempts:", error)
        res.status(500).json({
            success: false,
            message: "Failed to fetch practice attempts",
            error: error.message
        })
    }
}


module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    evaluateAnswerController,
    transcribeAudioController,
    practiceStatsController,
    practiceAttemptsController
}
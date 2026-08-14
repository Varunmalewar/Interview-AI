const { PDFParse } = require("pdf-parse")
const {generateinterviewreport, generateResumePdf} = require("../services/ai.service")
const InterviewReportModel = require("../models/interview.report.model.js")


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

        res.status(200).json({
            success: true,
            data: interviewReports
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


module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}
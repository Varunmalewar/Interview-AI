const express = require("express")
const authmiddlewares = require("../middlewares/auth.middlewares.js")
const interviewController = require("../controllers/interview.controller.js")
const upload = require("../middlewares/file.middleware.js")




const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authmiddlewares.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authmiddlewares.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authmiddlewares.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authmiddlewares.authUser, interviewController.generateResumePdfController)


/**
 * @route POST /api/interview/evaluate
 * @description evaluate a user's answer to an interview question against the model answer.
 * @access private
 */
interviewRouter.post("/evaluate", authmiddlewares.authUser, interviewController.evaluateAnswerController)


/**
 * @route POST /api/interview/transcribe
 * @description transcribe a spoken answer (WAV upload) into text using Gemini audio input.
 * @access private
 */
interviewRouter.post("/transcribe", authmiddlewares.authUser, upload.audioUpload.single("audio"), interviewController.transcribeAudioController)


/**
 * @route GET /api/interview/practice/stats
 * @description aggregated practice stats for the Progress dashboard (readiness, history, streak).
 * @access private
 */
interviewRouter.get("/practice/stats", authmiddlewares.authUser, interviewController.practiceStatsController)


/**
 * @route GET /api/interview/practice/attempts
 * @description recent practice attempts for the logged-in user (optionally filtered by report/section/mode).
 * @access private
 */
interviewRouter.get("/practice/attempts", authmiddlewares.authUser, interviewController.practiceAttemptsController)



module.exports = interviewRouter
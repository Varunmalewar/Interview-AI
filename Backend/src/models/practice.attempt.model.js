const mongoose = require('mongoose')

/**
 * One recorded practice attempt: a user's answer to an interview question
 * (from a generated report, a mock interview, or a follow-up) together with
 * the AI score, feedback, and the follow-up questions that were generated.
 *
 * This is the source of truth for the Progress/Readiness dashboard —
 * every practice, voice, and timed mock answer lands here via the
 * /evaluate endpoint.
 */
const practiceAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user is required"],
    },
    // The report this attempt belongs to (null for free practice / generic mocks)
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        default: null,
    },
    section: {
        type: String,
        enum: ["technical", "behavioral"],
        default: "technical",
    },
    mode: {
        type: String,
        enum: ["practice", "voice", "timed"],
        default: "practice",
    },
    question: {
        type: String,
        required: [true, "question is required"],
    },
    modelAnswer: {
        type: String,
        default: "",
    },
    userAnswer: {
        type: String,
        default: "",
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        required: [true, "score is required"],
    },
    feedback: {
        type: String,
        default: "",
    },
    keyPoints: {
        type: [String],
        default: [],
    },
    tips: {
        type: [String],
        default: [],
    },
    followUps: {
        type: [String],
        default: [],
    },
    // Set when this attempt is a follow-up on another question
    sourceQuestion: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
})

practiceAttemptSchema.index({ user: 1, createdAt: -1 })
practiceAttemptSchema.index({ user: 1, report: 1 })

const PracticeAttemptModel = mongoose.model("PracticeAttempt", practiceAttemptSchema)

module.exports = PracticeAttemptModel

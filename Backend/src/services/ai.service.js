const { GoogleGenAI, Type, createPartFromBase64 } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Native GenAI Schema for the interview report matching Mongoose model fields
const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        title: {
            type: Type.STRING,
            description: "The job title extracted from the job description"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them"
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioral question that can be asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of the interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them"
        },
        skillGaps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill which the candidate is lacking" },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                },
                required: ["skill", "severity"]
            },
            description: "List of skill gaps in the candidate's profile along with their severity"
        },
        preparationPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: Type.STRING, description: "The main focus of this day in the preparation plan" },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of tasks to be done on this day"
                    }
                },
                required: ["day", "focus", "tasks"]
            },
            description: "A day-wise preparation plan for the candidate to prepare for the interview effectively"
        }
    },
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

/**
 * Generates a structured interview report using Gemini AI
 */
async function generateinterviewreport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are an expert technical recruiter and career coach.
                    Analyze the following candidate profile against the job description and generate a detailed interview preparation report.

                    Resume: ${resume || "Not provided"}
                    Self Description: ${selfDescription || "Not provided"}
                    Job Description: ${jobDescription}

                    Generate a comprehensive interview report that includes:
                    1. A match score (0-100) indicating how well the candidate matches the job
                    2. EXACTLY 15 technical questions likely to be asked, with intentions and model answers
                    3. EXACTLY 15 behavioral questions likely to be asked, with intentions and model answers
                    4. Skill gaps the candidate should address before the interview
                    5. A day-wise preparation plan to help the candidate prepare effectively
                    6. The job title extracted from the job description

                    IMPORTANT:
                    - You MUST generate exactly 15 technical questions and exactly 15 behavioral questions. Do not generate fewer.
                    - Make each question genuinely distinct — cover a different topic, concept, or scenario in each one.
                    - For every question include a clear intention and a thorough model answer covering the key points the candidate should mention.
                    - Questions should range from fundamentals to advanced topics so the candidate is prepared for the full interview.
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        }
    });

    const jsonContent = JSON.parse(response.text);
    return jsonContent;
}

// Native GenAI Schema for evaluating a single user answer against a model answer
const evaluateAnswerSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the user's answer covers the key points of the model answer"
        },
        feedback: {
            type: Type.STRING,
            description: "Concise feedback on the user's answer — what was strong, what was missed or weak"
        },
        keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The key points the interviewer expected the candidate to mention, and whether the user covered them"
        },
        tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 actionable tips to improve the answer for a real interview"
        },
        followUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 short smart follow-up questions that probe exactly what the candidate missed or needs to deepen; empty array if the answer was strong"
        }
    },
    required: ["score", "feedback", "keyPoints", "tips", "followUps"]
};

/**
 * Evaluates a user's answer against a model answer using Gemini AI
 */
async function evaluateAnswer({ question, intention, modelAnswer, userAnswer }) {
    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
                    Question: ${question}
                    Intention: ${intention}
                    Model Answer (what an ideal candidate would cover): ${modelAnswer}
                    Candidate's Answer: ${userAnswer}

                    Evaluate the candidate's answer against the model answer:
                    1. Assign a score between 0 and 100 based on how well the candidate covered the key points
                    2. Provide concise feedback — what was strong, what was missed or weak
                    3. List the key points the interviewer expected, and whether the candidate covered them
                    4. Provide 2-3 actionable tips to improve the answer for a real interview
                    5. Generate 2-3 smart follow-up questions that probe exactly the points the candidate missed, rushed, or needs to deepen — they should feel like a real interviewer digging deeper. If the answer was near-perfect (score >= 85), return an empty array for followUps.
                    Be honest and specific. Score 100 only for a near-perfect answer.
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evaluateAnswerSchema,
        }
    });

    const jsonContent = JSON.parse(response.text);
    return jsonContent;
}

// Schema for transcribing a spoken answer
const transcribeAudioSchema = {
    type: Type.OBJECT,
    properties: {
        transcript: {
            type: Type.STRING,
            description: "The verbatim transcription of the candidate's spoken answer"
        }
    },
    required: ["transcript"]
};

/**
 * Transcribes a spoken answer (WAV bytes) into text using Gemini's audio input
 */
async function transcribeAudio({ audioBase64, mimeType = "audio/wav" }) {
    const prompt = `You are transcribing a candidate's spoken answer to an interview question.
                    Transcribe the speech verbatim — keep the exact words, but clean up filler
                    sounds (um, uh, like) and false starts. Do NOT summarize or add any explanation.
                    If the audio is silent or empty, return an empty string for transcript.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
            prompt,
            createPartFromBase64(audioBase64, mimeType),
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: transcribeAudioSchema,
        }
    });

    const jsonContent = JSON.parse(response.text);
    return jsonContent;
}
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

// Schema for the resume PDF
const resumePdfSchema = {
    type: Type.OBJECT,
    properties: {
        html: {
            type: Type.STRING,
            description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer"
        }
    },
    required: ["html"]
};

/**
 * Generates a tailored resume as HTML using Gemini AI
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an ATS-friendly, professional resume in HTML format for a candidate with the following details:
                    Resume: ${resume || "Not provided"}
                    Self Description: ${selfDescription || "Not provided"}
                    Job Description: ${jobDescription}

                    Requirements:
                    - Tailor the resume to the given job description
                    - Highlight the candidate's relevant strengths and experience
                    - The HTML should be well-formatted, structured, and visually appealing
                    - The content should NOT sound AI-generated — make it feel natural and human-written
                    - Use simple professional design with minimal colors
                    - Must be ATS-friendly (easily parsable by ATS systems)
                    - Keep it concise — ideally 1-2 pages when printed
                    `;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumePdfSchema,
        }
    });

    const jsonContent = JSON.parse(response.text);
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer;
}

module.exports = { generateinterviewreport, generateResumePdf, evaluateAnswer, transcribeAudio };


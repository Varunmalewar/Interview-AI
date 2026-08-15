const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cookieParser())

// Allow the frontend origin(s). Defaults to the local Vite dev server,
// override with CLIENT_URL (comma-separated for multiple origins) in .env.
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
    : ["http://localhost:5173"]

app.use(cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true
}))


// require all the routes here 
const authRouter = require('./routes/auth.routes.js')
const interviewRouter = require('./routes/interview.routes.js')

//  using all the routes here 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app

const usermodel = require("../models/user.model.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const tokenblacklistmodel = require("../models/blacklist.model.js")

const isProduction = process.env.NODE_ENV === "production"

/**
 * Secure, HttpOnly auth cookie.
 * - httpOnly : prevents XSS from reading the token via client-side JS.
 * - sameSite : defaults to "lax" (works when frontend + API share a site, e.g. localhost).
 *              Override with COOKIE_SAMESITE="none" for cross-origin HTTPS deployments
 *              (e.g. Vercel frontend + separate API host).
 * - secure   : only sent over HTTPS in production; override with COOKIE_SECURE=true/false.
 * - maxAge   : matches the JWT expiresIn of 1 day.
 */
const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    secure: process.env.COOKIE_SECURE === "true" || (isProduction && process.env.COOKIE_SECURE !== "false"),
    maxAge: 24 * 60 * 60 * 1000 // 1 day
}



/**
 * @name registerUserController
 * @desc Register a new user expects username , email and password in request body
 * @access Public
 */

async function registerUserController(req,res){

    const {username, email, password } = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message : "Please provide username , email and password"
        })
    }

    const isUserAlreadyExist = await usermodel.findOne({
        $or : [{username:username},{email:email}]
    })

    if(isUserAlreadyExist){
        return res.status(400).json({
            message : "User already exist with this username or email"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = await usermodel.create({
        username:username,
        email:email,
        password:hash
    })

    const token = jwt.sign(
        {id : user._id , username : user.username},
        process.env.JWT_SECRET,
        {expiresIn : "1d"}

    )
    res.cookie("token", token, cookieOptions)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id :user._id,
            username : user.username,
            email : user.email
        }
    })

}

/**
 * @name loginUserController
 * @desc login a user , expects email ans password in the request body 
 * @access Public
 */

async function loginUserController(req,res){
    const {email , password} = req.body 

    const user = await usermodel.findOne({email})

    if(!user){
        return res.status(400).json({
            message : "Invalid email or password"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message : "Invalid email or password"
        })
    }

    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    )

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        message : "User logged in successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}


/**
 * @name logoutUserController
 * @desc logout a user , expects email ans password in the request body 
 * @access Private
 */

async function logoutUserController(req,res){
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]
    if(!token){
        return res.status(400).json({
            message : "No token found"
        })
    }
    await tokenblacklistmodel.create({
        token:token
    })
    res.clearCookie("token", cookieOptions)
    res.status(200).json({
        message : "User logged out successfully"
    })
    
}

/**
 * 
 * @name getmecontroller
 * @desc get user profile
 * @access Private
 */

async function getmecontroller(req,res){
    try {
        const user = await usermodel.findById(req.user.id)
        res.status(200).json({
            message : "User found successfully",
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
        })
        
    } catch (error) {
        return res.status(400).json({
            message : "Error getting user profile",
            error : error.message
        })
    }

}

module.exports = { registerUserController, loginUserController, logoutUserController, getmecontroller }
const {Router} = require('express')
const {registerUserController, loginUserController, logoutUserController, getmecontroller} = require('../controllers/auth.controller.js')
const {authUser} = require('../middlewares/auth.middlewares.js')

const authRouter = Router()

/**
 * @routes POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", registerUserController)

/**
 * @routes POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post("/login", loginUserController)

/**
 * @route GET /api/auth/logout
 * @desc clear token from user cookie and add to the blacklist
 * @access Private
 */
authRouter.get("/logout", authUser, logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @desc Get current user profile 
 * @access Private
 */
authRouter.get("/get-me", authUser, getmecontroller)


module.exports = authRouter
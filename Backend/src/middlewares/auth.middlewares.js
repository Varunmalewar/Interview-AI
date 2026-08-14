const tokenblacklistmodel = require("../models/blacklist.model.js")
const jwt = require("jsonwebtoken")

async function authUser(req, res, next) {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]
    
    if (!token) {
        return res.status(401).json({
            message: "No token found, authorization denied"
        })
    }

    const istokenblacklisted = await tokenblacklistmodel.findOne({token:token})
    if(istokenblacklisted){
        return res.status(401).json({
            message: "Token is blacklisted, authorization denied"
        })
    }
    
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedToken
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Token is not valid",
            error: err.message
        })
    }
}

module.exports = { authUser }

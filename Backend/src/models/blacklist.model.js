const mongoose = require("mongoose")

const blackListTokenSchema = new mongoose.Schema({
    token :{
        type : String,
        required : [true,"token is required to be added in blacklist"]
    },
    createdAt : {
        type : Date,
        default : Date.now,
        // Auto-expire blacklisted tokens after 24 hours (matches JWT lifetime)
        // so the collection does not grow unbounded. MongoDB TTL index cleans these up.
        expires : 60 * 60 * 24
    }
})

const tokenblacklistmodel = mongoose.model("blacklisttoken",blackListTokenSchema)

module.exports = tokenblacklistmodel
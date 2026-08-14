const mongoose = require("mongoose")

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to DB")
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectToDB
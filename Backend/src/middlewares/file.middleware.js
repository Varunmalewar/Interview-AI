const multer = require("multer")

const upload = multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize : 5 *1024*1024 // 5 MB
    }
})

// Separate instance for audio uploads (spoken answers) — allows longer clips.
const audioUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
})

module.exports = upload
module.exports.audioUpload = audioUpload
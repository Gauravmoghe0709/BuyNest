const mongoose = require("mongoose")

async function connecttodb() {
    try {
        mongoose.connect(process.env.MONGOOSE_URI)
         console.log("Database connected...")
    } catch (error) {
         console.log(error)
    }
}

module.exports = connecttodb
const mongoose = require("mongoose")


async function connecttodatabase() {
    try {
        await mongoose.connect(process.env.MONGOOSE_URI)
        console.log("Cart Database connected")
    } catch (error) {
        console.log(error)
    }
}

module.exports=connecttodatabase
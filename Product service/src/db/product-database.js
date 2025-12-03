const mongoose = require("mongoose")


async function connecttodb() {
    try {
        await mongoose.connect(process.env.MONGOOSE_URI)
        console.log("connected to product-database")
    } catch (error) {
        console.log(error)
    }
}


module.exports=connecttodb
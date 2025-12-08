const mongoose = require("mongoose")


const cartscheme = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
    },
    items:[
        {
            productid:{
                type: mongoose.Schema.Types.ObjectId,
                require:true
            },
            quantity:{
                type:Number,
                require:true,
                min:1,
            },

        },
    ]
}, {timestamps:true})

const cartmodel = mongoose.model("cartdata",cartscheme)

module.exports = cartmodel
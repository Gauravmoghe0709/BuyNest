const mongoose = require("mongoose")

const productschema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        
    },
    price:{
        amount:{
            type:Number,
            require:true
        },
        currency:{
            type:String,
            enum:['USD','INR'],
            default: 'INR'
        }
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    images:[
        {
            url: String,
            thumbnail: String,
            id:String

        }
    ],
    stock:{
        type:Number,
        default:0
    }, 
})

productschema.index({title:"text",description:"text"})

  module.exports= mongoose.model("products",productschema)
const mongoose = require ("mongoose")

const addresschema = new mongoose.Schema({    
    street:String,
    city:String,
    state:String,
    zip: String,
    country:String,
    pincode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
})

const orderschema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                required: true,
            },

             quentity:{
                type:Number,
                default:1,
                min:1
             },
             price:{
                amount: {
                    type:Number,
                    required: true
                },
                currency:{
                    type: String,
                    required: true,
                    enum : ["USD", "INR"]
                }
             }
            
        }
    ],
     status:{
        type: String,
        enum: ["PENDING","CONFIRMED","SHIPPED","CANCELLED","DELIVERED"]
     },
      totalprice:{
        amount:{
            type: Number,
            required: true
        },
        currency:{
            type: String,
            required: true,
            enum:["USD","INR"]
        }
      },
      shippingaddress: addresschema

}, {timestamps:true})


const ordermodel = mongoose.model("orders",orderschema)

module.exports = ordermodel
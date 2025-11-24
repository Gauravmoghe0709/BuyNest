const mongoose = require("mongoose")

// This is a sub-Schema and passed in userschema
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

const userschema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        select:false,
    },

    fullname:{
        firstname:{type:String, required:true},
        lastname:{ type:String, required:true}
    },
    role:{
        type:String,
        enum:["user","seller"],
        default: "user"
    },
    address:[
        addresschema
    ]
})

const usermodel = mongoose.model("Auth-users",userschema)

module.exports = usermodel
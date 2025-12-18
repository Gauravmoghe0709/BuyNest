const ordermodel = require("../models/order.model")
const axios = require("axios")


async function createOrder(req,res){
    const user  = req.user
    const token = req.cookies.token || req.headers?.authorization?.split(" ")[1]

    try {
        const cartresponse = await axios.get(`http://localhost:3002/cart/getcart`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })

        console.log("Cart response data:", cartresponse);
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}



module.exports = {
    createOrder
}
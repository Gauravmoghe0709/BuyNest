const express = require ("express")
const authmiddleware  = require ("../middleware/authmiddleware")
const OrderController = require("../controller/order.controller")

const router = express.Router()

router.post("/createorder",authmiddleware(["user"]),OrderController.createOrder)




module.exports = router
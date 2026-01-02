const express = require ("express")
const authmiddleware  = require ("../middleware/authmiddleware")
const OrderController = require("../controller/order.controller")
const validation = require("../middlewares/validation.middleware")

const router = express.Router()

router.post("/createorder",authmiddleware(["user"]),OrderController.createOrder)

router.get("/me", authmiddleware([ "user" ]), OrderController.getMyOrders)

router.post("/:id/cancel", authmiddleware([ "user" ]), OrderController.cancelOrderById)

router.patch("/:id/address", authmiddleware([ "user" ]), validation.updateAddressValidation, OrderController.updateOrderAddress)

router.get("/:id", authmiddleware([ "user", "admin" ]), OrderController.getOrderById)



module.exports = router
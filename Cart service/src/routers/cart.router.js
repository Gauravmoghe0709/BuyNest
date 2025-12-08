const express = require ("express")
const router = express.Router()
const createAuthMiddleware = require("../middleware/authmiddleware")
const validation = require ("../middleware/validation")
const cartController = require ("../controllers/cart.controller")



router.get("/",createAuthMiddleware(["user"]),cartController.getcart)
router.post("/items",validation.validateaddcarditems,createAuthMiddleware(["user"]),cartController.addtocart)
router.patch('/items/:productId',validation.validateUpdateCartItem,createAuthMiddleware([ 'user' ]),cartController.updateItemQuantity);

module.exports = router
const express  = require("express")
const router = express.Router()
const validator = require("../middleware/authvalidator.middleware")
const authcontroller = require("../controllers/auth.controller")
const authmiddleware = require ("../middleware/authmiddleware")



router.post("/register",validator.registeruservalidation,authcontroller.registeruser)
router.post("/login",validator.loginvalidation,authcontroller.loginuser)
router.get("/me",authmiddleware.authmiddleware,authcontroller.getMe)
router.get("/logout",authcontroller.logout)
router.get("/me/addresses",authmiddleware.authmiddleware, authcontroller.getuseraddress)
router.post("/me/addresses",authmiddleware.authmiddleware,validator.addressvalidator,authcontroller.adduseraddress)
router.delete("/me/addresses/:addressId",authmiddleware.authmiddleware,authcontroller.deleteuseraddress)



module.exports = router


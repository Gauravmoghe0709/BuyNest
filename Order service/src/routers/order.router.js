const express = require("express")
const authmiddleware  = require ("../middleware/authmiddleware")

const router = express.Router()

router.post("/create-order",authmiddleware(["user"]))




module.exports = router
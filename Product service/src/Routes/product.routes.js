const express = require("express")
const multer = require("multer")
const productcontroller = require('../Controllers/product.controller')
const { createProductValidation } = require('../middleware/product.validator')
const authmiddleware = require ("../middleware/auth.middleware")

const router = express.Router()
const upload = multer({storage:multer.memoryStorage()})


router.post("/", authmiddleware(['admin','seller']), upload.single('image'), createProductValidation, productcontroller.createProduct)


module.exports = router

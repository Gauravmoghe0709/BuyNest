const express = require ('express');
const multer = require('multer');
const productController = require('../controller/product.controller');
const createAuthMiddleware = require("../middleware/auth.middleware");
const { createProductValidators } = require('../validators/product.validator');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products
router.post(
    '/create-product',
    createAuthMiddleware([ 'admin', 'seller' ]),
    upload.array('images', 5),
    createProductValidators,
    productController.createProduct);

router.get("/",productController.getProducts)



router.patch("/:id",createAuthMiddleware(["seller"]),productController.updateproduct)

router.delete("/:id",createAuthMiddleware(["seller"]),productController.deleteproduct)

router.get("/:id",productController.getproductbyid)


router.get("/seller",createAuthMiddleware(["seller"]),productController.getproductbyseller)


module.exports = router

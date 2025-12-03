const express = require('express');
const cookieparser = require ("cookie-parser")
const productroute = require("./router/product.router")


const app = express();
app.use(express.json())
app.use(cookieparser())
app.use("/product",productroute)



module.exports = app;
const express = require("express")
const cookieparser = require("cookie-parser")
const productrouter = require("./Routes/product.routes")
const app = express()


app.use(cookieparser())
app.use(express.json())
app.use("/products",productrouter)






module.exports=app
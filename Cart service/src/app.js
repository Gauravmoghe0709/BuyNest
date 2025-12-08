const express = require("express")
const app = express()
const connecttodatabase = require("./db/cartdatabase")
const cookieparser = require ("cookie-parser")
const cartrouter = require("./routers/cart.router")

connecttodatabase()

app.use(express.json())
app.use(cookieparser())

app.use("/cart",cartrouter)





module.exports = app


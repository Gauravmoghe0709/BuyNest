const express = require("express")
const orderrouter = require ("./routers/order.router")
const app = express()
const cookieparser = require("cookie-parser")

app.use(express.json())
app.use(cookieparser())
app.use("/orders",orderrouter)





module.exports = app
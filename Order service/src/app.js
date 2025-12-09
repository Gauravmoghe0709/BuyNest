const express = require("express")
const app = express()
const cookieparser = require("cookie-parser")

app.use(express.json())
app.use(cookieparser())






module.exports = app
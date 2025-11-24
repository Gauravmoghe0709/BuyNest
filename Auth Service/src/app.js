const express = require("express")
const cookieparser = require("cookie-parser")
const app = express()
const authrouter = require("./routes/auth.router")



app.use(cookieparser())
app.use(express.json())

app.use('/auth',authrouter)








module.exports=app
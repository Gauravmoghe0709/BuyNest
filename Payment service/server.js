require("dotenv").config()
const app = require ("./src/app")
const connecttodb = require("./src/db/db")


connecttodb()

app.listen(3004, ()=>{
    console.log("Payment service running on port 3004")
})



require("dotenv").config()
const app = require("./src/app")
const connecttodb = require("./src/db/product-database")



connecttodb()
app.listen(3004,()=>{
    console.log("product service is running on port 3004")
})
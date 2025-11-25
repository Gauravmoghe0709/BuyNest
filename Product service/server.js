require("dotenv").config()
const app = require("./src/app")
const connecttodb = require("./src/Database/Product-DataBase")



connecttodb()
app.listen(3001,()=>{
    console.log("Product service running on port 3001")
})
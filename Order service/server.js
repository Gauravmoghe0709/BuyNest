require ("dotenv").config()
const app = require ("./src/app")
const connecttodb = require ("./src/db/db")


connecttodb()
app.listen(3003, ()=>{
    console.log("order service running on 3003")
})
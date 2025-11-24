const usermodel = require("../models/user.model")
const jwt = require("jsonwebtoken")

                                     
async function authmiddleware(req, res, next) {

    const token = req.cookies?.token

    if (!token) { return res.status(401).json({ message: "invalid token..." })}


    try {

        const secret = process.env.JWT_SECRATE || 'test_secret_key'
        const decoded = jwt.verify(token, secret)

        const user = decoded
        req.user = user
        next()


    } catch (error) {
        console.error('getMe error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}



module.exports = {
    authmiddleware
}
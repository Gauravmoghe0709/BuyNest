const jwt = require("jsonwebtoken")


function createauthmiddleware(roles=["user"]){

    return function authmiddleware(req, res, next) {
        const authHeader = req.headers.authorization || ''
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
        const token = req.cookies?.token || bearerToken

        if (!token) {
            return res.status(401).json({
                message: "unauthorized"
            })
        }

        try {
            const secret = process.env.JWT_SECRATE || 'test_secret_key'
            const decode = jwt.verify(token, secret)
            // Checks if role value exists in decode.role
            if (!roles.includes(decode.role)) {
                return res.status(403).json({
                    message: "forbidden"
                })
            }

            req.user = decode
            next()
        } catch (error) {
            console.error('auth middleware error:', error)
            return res.status(401).json({ message: 'invalid token' })
        }

    }
}

module.exports = createauthmiddleware
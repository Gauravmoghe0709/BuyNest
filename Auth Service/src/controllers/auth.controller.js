const usermodel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const redis = require("../Database/redis")


async function registeruser(req, res) {
    const { username, email, password, fullname = {}, role } = req.body
    const { firstname, lastname } = fullname

    try {

        const userexist = await usermodel.findOne({
            $or: [
                { username },
                { email }
            ]
        })



        if (userexist) {
            return res.status(400).json({
                message: "user already exist.."
            })
        }

        const hashpassword = await bcrypt.hash(password, 10)



        const createData = {
            username,
            email,
            password: hashpassword,
            fullname: { firstname, lastname }
        }

        if (role) {
            createData.role = role
        }

        const user = await usermodel.create(createData)





        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRATE || 'test_secret_key')



        res.cookie("token", token, {
            httpOnly: true, // This means the cookie cannot be accessed using JavaScript (document.cookie) in the browser.
            secure: true, // It ensures your token is not exposed on insecure connections
            maxAge: 24 * 60 * 60 * 1000, // Defines how long the cookie should stay valid (in milliseconds).
        })



        res.status(201).json({
            message: "new user created ",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                address: user.address
            }
        })
    } catch (error) {
        console.error("Register error:", error)
        res.status(500).json({ message: "Internal server error", error: error.message })
    }

}

async function loginuser(req, res) {
    const { username, email, password } = req.body

    try {
        const userexist = await usermodel.findOne({
            $or: [{ username }, { email }]
        }).select("+password")


        if (!userexist) {
            return res.status(401).json({
                message: "invalid credentials"
            })
        }

        const ispassword = await bcrypt.compare(password, userexist.password || "")



        if (!ispassword) {
            return res.status(401).json({
                message: "password dose not match"
            })
        }

        const token = jwt.sign({
            id: userexist._id,
            username: userexist.username,
            email: userexist.email,
            role: userexist.role
        }, process.env.JWT_SECRATE || 'test_secret_key')



        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        })

        return res.status(200).json({
            message: "login sucessfully",
            user: {
                id: userexist._id,
                username: userexist.username,
                email: userexist.email,
                role: userexist.role,
                address: userexist.address
            }
        })

    } catch (error) {
        console.error("Register error:", error)
        res.status(500).json({ message: "Internal server error", error: error.message })
    }


}


async function getMe(req, res) {
    const user = req.user

    return res.status(201).json({
        message: "current user fetch sucessfully...",
        user
    })
}

async function logout(req, res) {

    const token = req.cookies.token

    if (token) {
        await redis.set(`blacklist:${token}`, "true", "ex", 24 * 60 * 60)
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: true
    })

    return res.status(200).json({
        message: "logged out sucessfully.."
    })

}

async function getuseraddress(req, res) {
    const id = req.user.id
    const user = await usermodel.findById(id).select("address")

    if (!user) {
        return res.status(401).json({
            message: "user not found"
        })
    }

    return res.status(200).json({
        message: "user address fetched sucessfully...",
        addresses: user.address
    })

}

async function adduseraddress(req, res) {
    const id = req.user.id

    const { street, city, state, pincode, country, phone, isDefault } = req.body

    // If isDefault is true, unset existing default
    if (isDefault) {
        await usermodel.updateOne({ _id: id, 'address.isDefault': true }, { $set: { 'address.$.isDefault': false } })
    }

    const user = await usermodel.findOneAndUpdate({ _id: id }, {
        $push: {
            address: {
                street, city, state, pincode, country, phone, isDefault: !!isDefault
            }
        }
    }, { new: true })

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    return res.status(201).json({
        message: "address add sucessfully...",
        address: user.address[user.address.length - 1]
    })


}

async function deleteuseraddress(req, res) {
    const id = req.user.id
    const { addressId } = req.params

    const user = await usermodel.findOneAndUpdate({ _id: id }, {
        $pull: {
            address: { _id: addressId }
        }
    }, { new: true })

    /* findOneAndUpdate:- finds the user and updates them.

    $pull:- removes items from an array.

    Here, we remove from address array the object where _id == addressId.

    { new: true } returns the updated document (after removal).*/

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    // Verify deletion: if any address still has the id, deletion failed
    const addressexist = user.address.some(adder => adder._id.toString() === addressId)

    if (addressexist) {
        return res.status(500).json({
            message: "failed to delete address"
        })
    }

    res.status(200).json({
        message: "address delete sucessfully",
        addresses: user.address
    })
}

module.exports = {
    registeruser,
    loginuser,
    getMe,
    logout,
    getuseraddress,
    adduseraddress,
    deleteuseraddress

}
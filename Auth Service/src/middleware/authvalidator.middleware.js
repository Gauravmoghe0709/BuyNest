const {body, validationResult} = require("express-validator")


const responsewithvalidation = (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }

     next()
}

const registeruservalidation=[
    body("username")
    .isString()
    .withMessage("username must be string ")
    .isLength({min:3})
    .withMessage("username must be 3 characters long"),
    
    body("email")
    .isEmail()
    .withMessage("invalid email-id"),

    body("password")
    .isLength({min:6})
    .withMessage("password must be 6 character long "),

    body ("fullname.firstname")
    .isString()
    .withMessage("firstname must be string")
    .notEmpty()
    .withMessage("first name is required"),

    body ("fullname.lastname")
    .isString()
    .withMessage("lastname must be string")
    .notEmpty()
    .withMessage("lastname is required"),
    body('role')
    .optional()
    .isIn(['user','seller'])
    .withMessage('role must be one of: user, seller'),
    
    responsewithvalidation

]

const loginvalidation=[
        body("email")
        .optional()
        .isEmail().withMessage("invalid email..."),
        body("username")
        .optional()
        .isString()
        .withMessage("username must be string"),
        body("password").isLength({min:6})
        .withMessage("password must be 6 characters long"),
        (req,res,next)=>{
            if(!req.body.email && ! req.body.username){
                return res.status(400).json({
                    error:[{msg:"either email or username is required"}]})
            }
               responsewithvalidation(req,res,next)

        }

       

]

const addressvalidator=[
    body("street")
    .isString()
    .withMessage("street must be string")
    .notEmpty()
    .withMessage("street require"),
    body("city")
    .isString()
    .withMessage("city must be string")
    .notEmpty()
    .withMessage("city require"),
     body("state")
    .isString()
    .withMessage("state must be string")
    .notEmpty()
    .withMessage("state is require"),
     body("pincode")
    .isString()
    .withMessage("pincode must be string")
    .notEmpty()
    .withMessage("pincode require"),
    body("pincode")
    .isLength({ min: 6 })
    .withMessage("pincode must be at least 6 characters long"),
     body("phone")
    .optional()
    .isNumeric()
    .withMessage("phone must contain only digits")
    .isLength({min:10,max:15})
    .withMessage("phone must be between 10 and 15 digits"),
     body("country")
    .isString()
    .withMessage("country must be string")
    .notEmpty()
    .withMessage("country is require"),
     body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be boolean"),
    responsewithvalidation
]





module.exports = {
    registeruservalidation,
    loginvalidation,
    addressvalidator
}
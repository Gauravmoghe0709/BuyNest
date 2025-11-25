const { body, validationResult } = require('express-validator')

const responseWithValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

const createProductValidation = [
  body('title')
    .isString()
    .trim()
    .withMessage('title must be a string')
    .notEmpty()
    .withMessage('title is required'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('description must be shorter than 1000 characters'),
  body('priceamount')
    .exists()
    .withMessage('priceamount is required')
    .bail()
    .isNumeric()
    .withMessage('priceamount must be a number')
    .bail()
    .custom((v) => Number(v) > 0)
    .withMessage('priceamount must be greater than 0'),
  body('pricecurrency')
    .exists()
    .withMessage('pricecurrency is required')
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('pricecurrency must be a 3-letter currency code')
    .bail()
    .toUpperCase()
    .matches(/^[A-Z]{3}$/)
    .withMessage('pricecurrency must be a 3-letter alphabetic currency code'),

  responseWithValidation
]

module.exports = {
  createProductValidation
}

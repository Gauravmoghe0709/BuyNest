const productmodel = require("../models/product.model")
const uploadfile = require("../services/imagekit.service")
const { v4: uuidv4 } = require('uuid')
const path = require('path')


async function createProduct(req, res) {
  try {
    // In real app you'd save product data and upload image via ImageKit
    const { title, description,priceamount,pricecurrency= 'INR' } = req.body

        if(!priceamount|| !title){
            return res.status(400).json({
                message:"title and price amount is require"
            })
        }

        const seller = req.user.id
            
        const price={
            amount:Number(priceamount),
            currency:pricecurrency
        }
        const images=[]

        // Support single file (upload.single) or multiple files (upload.array)
        if (req.file) {
          // single file
          const orig = req.file.originalname || ''
          const ext = path.extname(orig)
          const filename = uuidv4() + ext
          const uploaded = await uploadfile({ buffer: req.file.buffer, originalname: req.file.originalname }, filename)
          images.push({ url: uploaded.url, fileId: uploaded.fileId || uploaded.fileId })
        } else if (Array.isArray(req.files) && req.files.length) {
          const files = await Promise.all(req.files.map(async (file) => {
            const orig = file.originalname || ''
            const ext = path.extname(orig)
            const filename = uuidv4() + ext
            const uploaded = await uploadfile({ buffer: file.buffer, originalname: file.originalname }, filename)
            return { url: uploaded.url, fileId: uploaded.fileId || uploaded.fileId }
          }))
          images.push(...files)
        }

        const product = await productmodel.create({title,description,price,seller,images})
        
        return res.status(201).json({
          message:"new product created..",
          data:product
        })


  } catch (err) {
    console.error('createProduct error:', err)
    return res.status(500).json({ message: 'internal error' })
  }
}

module.exports = {
  createProduct
}

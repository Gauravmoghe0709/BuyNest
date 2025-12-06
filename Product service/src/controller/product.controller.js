const { default: mongoose } = require('mongoose');
const productModel = require('../model/product.model');
const { uploadImage } = require('../services/imagekit.service');




async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body;
        const seller = req.user.id; // Extract seller from authenticated user

        const price = {
            amount: Number(priceAmount),
            currency: priceCurrency,
        };

        const images = await Promise.all((req.files || []).map(file => uploadImage({ buffer: file.buffer })));


        const product = await productModel.create({ title, description, price, seller, images });

        return res.status(201).json({
            message: 'Product created',
            data: product,
        });
    } catch (err) {
        console.error('Create product error', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProducts(req, res) {

    const {q, minprice,maxprice,limit=20,skip=0}= req.query;

    const filter={};

    if(q){ 
        filter.$text={$search:q}
}
 if(minprice || maxprice){

    filter["price.amount"]={...filter["price.amount"],$get: Number(minprice) || 0,};
 }

 if(maxprice){
    filter["price.amount"]={...filter["price.amount"],$lte: Number (maxprice),};

    const products = await productModel.find(filter).limit(math.min(Number(limit),20)).skip(Number(skip));

    return res.status(200).json({
        message: "Products fetched successfully",
        data: products,
    });
    
 }
}

async function getproductbyid(req,res){
    const {id} = req.params

    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message: "product not found"
        })
    }

    res.status(201).json({
        data:product
    })
    
}

async function updateproduct(req,res){
    
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"invalid id "})
    }

    const product = await productModel.findOne({
        _id:id,
        seller:req.user.id
    })

    if(!product){
        return res.status(404).json({message:"product not found"})
    }

    const updateproduct = ["title","description","price"]
    for(const key of Object.keys(req.body)){
        if(updateproduct.includes(key)){
            if(key=== "price" && typeof req.body.price == "object"){
                if(req.body.amount !== undefined){
                    product.price.amount = Number(req.body.price.amount)
                }
                if (req.body.currency !== undefined){
                    product.price.currency = req.body.price.currency
                }

            }else{
                product [key] = req.body[key]
            }

        }
    }
    await product.save()
    res.status(200).json({
        message: "product updated",
        product,
    })
}

async function deleteproduct(req,res){
    
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({message: "invalid id"})
    }

    const product = await productModel.findOne({
        _id:id,

    })

    if(!product){
        return res.status(404).json({message: "product not found"})
    }
    if(product.seller.toString() !== req.user.id){
        return res.status(403).json({message: "forbidden: you can only your own product"})
    }

    await product.remove()
    res.status(200).json({message: "product deleted"})
}

async function getproductbyseller(req,res) {
    
    const seller  = req.user

    const {skip=0,limit=20} = req.query

    const product = await productmodel.find({seller:seller.id}).skip(skip).limit(math.min(limit,20))

    return res.status(200).json({data:product})
}


module.exports = {
    createProduct,
    getProducts,
    getproductbyid,
    updateproduct,
    deleteproduct,
    getproductbyseller

}

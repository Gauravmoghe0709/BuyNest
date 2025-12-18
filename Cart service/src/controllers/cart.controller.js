const cartmodel = require("../model/cart.model")


async function addtocart(req,res){
 
    const user = req.user

    let cart = await cartmodel.findOne({user: user._id})

    if(!cart){
        cart = new cartmodel({user: user._id, items:[]})
    }

    const existingitemsindex = cart.items.findindex(items=>items.productId.tostring()===productId)

    if(existingitemsindex >= 0){
        cart.items[existingitemsindex].quantity += qty
    } else{
        cart.items.push({productId, quantity: qty })
    }

    await cart.save()

    res.status(200).json({
        message: "items add to cart",
        cart,
    })
}

async function updateItemQuantity(req, res) {
    const { productId } = req.params;
    const { qty } = req.body;
    const user = req.user;
    const cart = await cartModel.findOne({ user: user.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (existingItemIndex < 0) {
        return res.status(404).json({ message: 'Item not found' });
    }
    cart.items[ existingItemIndex ].quantity = qty;
    await cart.save();
    res.status(200).json({ message: 'Item updated', cart });
}

async function getcart(req,res) {

    const id = req.user.id
    
    let cart = await cartmodel.findOne({user : id})

    if(!cart){
        cart = new cartmodel({ user: id, items:[]})
        await cart.save()
    }

    res.status(200).json({
        cart,
        totals:{
            itemscount : cart.items.length,
            totalquantity: cart.items.reduce((acc, item) => acc + item.quantity, 0)
        }
    })
}


module.exports = {
    addtocart,
    updateItemQuantity,
    getcart
}
const Router = require("router")
const database = require("../database.js")
const router = Router()
const { sequelize } = require("../database.js");
const DataTypes = sequelize.DataTypes;
const tables = database.tables

const bcrypt = require('bcrypt');
const e = require("express");
const saltRounds = 10;


// create one user
router.post('/create-user', async(req, res, next) => {
    try {
        if (req.body.email && req.body.email !== null && 
            req.body.email !== '' && 
            req.body.password && 
            req.body.password !== null && 
            req.body.password !== '' &&
            req.body.phoneNumber &&
            req.body.phoneNumber != null &&
            req.body.phoneNumber !== ''
            ) {

            let response = await tables.Client.findOne({ where: { email: req.body.email } })
            if (response == null) {
                const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);
                await tables['Client'].create({ 
                    email: req.body.email, 
                    password: passwordHash , 
                    phoneNumber: req.body.phoneNumber
                })
                res.status(201).json({
                    Message: "Resource created",
                    statusCode: 201
                })
            }
            else {
                res.status(409).json({
                    Message: "User already exists",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// check if user exists
router.get("/login", async(req, res, next) => {
    try {
        if (Object.entries(req.query).length != 0 && req.query.email !== undefined && req.query.email !== '' && req.query.password !== undefined && req.query.password !== '') {
            await tables['Client'].findOne({
                where: { email: req.query.email }
            }).then(client => {
                if (client) {
                    const existsPasswordMatch = bcrypt.compareSync(req.query.password, client['dataValues']['password'])
                    if (existsPasswordMatch) {
                        res.status(200).json(client)
                    }
                    else {
                        res.status(404).json({
                            Message: "Incorrect username or password",
                            statusCode: 404
                        })
                    }
                }
                else {
                    res.status(404).json({
                        Message: "Incorrect username or password",
                        statusCode: 404
                    })
                }
            })
        }
        else {
            res.status(400).json({ Message: "Bad request" })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// update user password
router.put('/change-password', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.password && req.query.password !== null && req.query.password !== '') {
            await tables['Client'].findOne({
                where: {
                    email: req.query.email
                }
            }).then(client => {
                if (client) {
                    const passwordHash = bcrypt.hashSync(req.query.password, saltRounds);
                    client.update({ password: passwordHash }).then(() => {
                        res.status(200).json({
                            Message: "Password updated",
                            statusCode : 200
                            })
                    })
                }
                else {
                    res.status(404).json({ 
                        Message: "Username doesn't exists",
                        statusCode: 404
                    })
                }
            })
        }
        else {
            res.status(400).json({ Message: "Bad request" })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// add credit card to user
router.post('/create-credit-card/add', async(req, res, next) => {
    try {
        if (validateCreditCardInfo(req) && req.query && req.query.email !== null && req.query.email !== '') {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                let creditCards = await tables.CreditCard.findAll({ where: { clientClientID: client.clientID } })
                let cardCardMatch
                for(var i = 0; i < creditCards.length; i++){
                    cardCardMatch = bcrypt.compareSync(req.body.cardNumber, creditCards[i].cardNumber)
                    if(cardCardMatch){
                        break;
                    }
                }
                if(cardCardMatch) {
                    // exists credit card
                    res.status(409).json({
                        Message: "Credit card already exists",
                        statusCode: 409
                    })
                } else {
                    // credit card does not exist
                    // const cardNumberHash = bcrypt.hashSync(req.body.cardNumber, saltRounds);
                    // const cardHolderHash = bcrypt.hashSync(req.body.cardHolder, saltRounds);
                    // const CVVHash = bcrypt.hashSync(req.body.CVV, saltRounds);
                    await tables['CreditCard'].create({ 
                        cardNumber: req.body.cardNumber, 
                        cardType: req.body.cardType , 
                        validDate: req.body.validDate,
                        cardHolder: req.body.cardHolder,
                        CVV: req.body.CVV,
                        clientClientID: client.clientID
                    })
                        res.status(201).json({
                        Message: "Resource created",
                        statusCode: 201
                    })
                }
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


//get all cards for one user
router.get("/:userEmail/creditCards", async(req, res, next) => {
    try{
        await tables['Client'].findOne({
            where : {
                email : req.params.userEmail
            }
        }).then(user => {
            if(user){
                tables.CreditCard.findAll({
                    where: {
                        clientClientID : user.clientID
                    }
                }).then(items => {
                    let array = [];
                    for (var i = 0 ; i < items.length; i++) {
                        array.push(items[i].dataValues)
                    }                    
                    res.status(200).json( array);
                })
            }else{
                res.status(404).json({Message : "Username doesn't exists"})
            }
        })
    }catch(error){
        console.warn(error)
        res.status(500).json({Message : "Server error"})
    }
})


// delete credit card from user
router.delete('/credit-card/delete', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query && req.query.cardNumber !== null && req.query.cardNumber !== '') {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                tables.CreditCard.destroy({ where: { clientClientID: client.clientID, cardNumber: req.query.cardNumber} })
                    .then(() => {
                        res.status(200).json("Resource deleted")
                    })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})



// create shopping list
router.post('/create-shopping-list', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListName) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                await tables['ShoppingList'].create({ 
                    name: req.query.shoppingListName, 
                    numberOfItems: 0 , 
                    status: 0,
                    clientClientID: client.clientID
                }).then(createdShoppingList => {
                    let jsonObject = {}
                    jsonObject['ID'] = createdShoppingList.shoppingListID
                    jsonObject['name'] = createdShoppingList.name
                    jsonObject['numberOfItems'] = createdShoppingList.numberOfItems
                    jsonObject['status'] = createdShoppingList.status
                    jsonObject['shoppingListItem'] = []
                    res.status(201).json(jsonObject)
                })
                
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


// add item to shopping list 
router.post('/shopping-list/add-item', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                await tables['ShoppingListItem'].create({ 
                    itemName: req.body.itemName, 
                    quantity: req.body.quantity , 
                    unitType: req.body.unitType,
                    bought: req.body.bought,
                    shoppingListShoppingListID: req.query.shoppingListID
                }).then(createdItem => {
                    res.status(201).json(createdItem)
                })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


// get all items from shoppinglist 
router.get('/shopping-list/get-all-items', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '') {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                let shoppingList = await tables['ShoppingList'].findAll({where: {clientClientID: client.clientID}})
                let finalList = []
                for(let i = 0; i < shoppingList.length; i++) {
                    let jsonShoppingListObject = {}
                    jsonShoppingListObject['ID'] = shoppingList[i].shoppingListID
                    jsonShoppingListObject['name'] = shoppingList[i].name
                    jsonShoppingListObject['numberOfItems'] = shoppingList[i].numberOfItems
                    jsonShoppingListObject['status'] = shoppingList[i].status

                    let jsonshoppingListItem = []
                    let shoppingListItems = await tables['ShoppingListItem'].findAll({where: {shoppingListShoppingListID:shoppingList[i].shoppingListID }})
                    for(let j = 0; j < shoppingListItems.length;j++) {
                        let jsonItem = {}
                        jsonItem['itemName'] = shoppingListItems[j].itemName
                        jsonItem['quantity'] = shoppingListItems[j].quantity
                        jsonItem['unitType'] = shoppingListItems[j].unitType
                        jsonItem['bought'] = shoppingListItems[j].bought == 1
                        jsonshoppingListItem.push(jsonItem)
                    }
                    jsonShoppingListObject['shoppingListItem'] = jsonshoppingListItem
                    finalList.push(jsonShoppingListObject)
                }
                res.status(200).json(finalList)
               
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


// update status and numberOfItems from shoppingList
router.put('/shopping-list/update-shopping-list', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '') {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                for(let i = 0; i < req.body.length; i++) {
                    let shoppingList = await tables['ShoppingList'].findOne({where: {clientClientID: client.clientID,shoppingListID: req.body[i].ID}})
                    shoppingList.update( {
                        numberOfItems: req.body[i].numberOfItems,
                        status: req.body[i].status
                    })
                }
                res.status(200).json("Updated")
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


// update items from shoppingListItems
router.put('/shopping-list/update-items', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                for(let i = 0; i < req.body.length; i++) {
                    let item = await tables['ShoppingListItem'].findOne({where: {shoppingListShoppingListID: req.query.shoppingListID, itemName:req.body[i].itemName}})
                    let status;
                    if(req.body[i].bought) {
                        status = "1"
                    } else {
                        status="0"
                    }

                    item.update({
                        itemName: req.body[i].itemName,
                        quantity: req.body[i].quantity,
                        unitType: req.body[i].unitType,
                        bought: status
                    })
                }
                res.status(200).json("Updated")
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// remove item from shopping list 
router.delete('/shopping-list/remove-item', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID && req.query.itemName) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                await tables['ShoppingListItem'].destroy({ where: { shoppingListShoppingListID: req.query.shoppingListID, itemName: req.query.itemName} })
                .then(() => {
                    res.status(200).json("Resource deleted")
                })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})


// update item from shopping list 
router.put('/shopping-list/update-item', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID && req.query.itemName) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                currentShoppingListItem = await tables['ShoppingListItem'].findOne({ where: { shoppingListShoppingListID: req.query.shoppingListID, itemName: req.query.itemName} })
                currentShoppingListItem.update(
                    {
                        itemName: req.body.itemName, 
                        quantity: req.body.quantity , 
                        unitType: req.body.unitType,
                        bought: req.body.bought,
                    })
                .then(updatedItem => {
                    res.status(201).json("Update OK")
                })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})




// delete shopping list and the items inside
router.delete('/shopping-list/delete-shopping-list', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                await tables['ShoppingListItem'].destroy({ where: { shoppingListShoppingListID: req.query.shoppingListID} })
                .then(() => {
                    tables['ShoppingList'].destroy({ where: { shoppingListID: req.query.shoppingListID, clientClientID: client.clientID} })
                    .then(() => {
                        res.status(200).json("Resource deleted")
                    })
                })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})



// add multimple items to shopping list 
router.post('/shopping-list/add-multiple-items', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.shoppingListID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                for(let i = 0; i < req.body.length; i++) {
                    req.body[i]['shoppingListShoppingListID'] = req.query.shoppingListID
                }
                await tables['ShoppingListItem']
                    .bulkCreate(req.body)
                    .then(() => {
                        res.status(201).json("Resource created!")
                    })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})


// create cart 
router.post('/create-shopping-cart', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '') {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                await tables['ShoppingCart'].create({ 
                    totalToPay: 0.0, 
                    totalProducts: 0 , 
                    clientClientID: client.clientID
                }).then(createdShoppingCart => {
                    let jsonObject = {}
                    jsonObject['idCart'] = createdShoppingCart.cartId
                    jsonObject['totalToPaid'] = createdShoppingCart.totalToPaid
                    jsonObject['totalProducts'] = createdShoppingCart.totalProducts,
                    jsonObject['cartItemList'] = []
                    res.status(201).json(jsonObject)
                })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// update cart 
router.put('/update-shopping-cart', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.cartID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                let cart = await tables['ShoppingCart'].findOne({where: {clientClientID: client.clientID, cartId: req.query.cartID}})
                cart
                    .update({
                        totalToPay: req.body.totalToPay,
                        totalProducts: req.body.totalProducts
                    })
                    .then(createdShoppingCart => {
                        res.status(201).json("updated")
                    })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})


// add multimple items to  cart 
router.post('/shopping-cart/add-multiple-cart-items', async(req, res, next) => {
    try {
        if (req.query && req.query.email !== null && req.query.email !== '' && req.query.cartID) {
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            if(client != null) {
                for(let i = 0; i < req.body.length; i++) {
                    req.body[i]['shoppingCartCartId'] = req.query.cartID
                    req.body[i]['productProductID'] = req.body[i]['product']['productID']
                }
                await tables['CartItem']
                    .bulkCreate(req.body)
                    .then(() => { 
                        res.status(201).json("Resource created!")
                    })
            } else {
                res.status(404).json({
                    Message: "User not found",
                    statusCode: 409
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// create invoice 
router.post('/create-invoice', async(req, res, next) => {
    try {
            await tables['Invoice'].create({ 
                date: req.body.date, 
                shoppingCartCartId: req.body.cart.idCart, 
                shopShopID: req.body.shop.idShop
            }).then(createdInvoice => {
                res.status(201).json(createdInvoice)
            })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Server error" })
    }
})

// get all invoices  2
router.get('/invoice/get-all-2', async(req, res, next) => {
    try {
        if (req.query && req.query.email && req.query.shopID) {
            let client = await tables['Client'].findOne({where: {email: req.query.email}})
            let shop = await tables['Shop'].findOne({where: {shopID: req.query.shopID}})
            if(client != null){
                let carts = await tables['ShoppingCart'].findAll({where: {clientClientID: client.clientID}})
                if(carts == null) {
                    res.status(200).json([]);
                } else {
                    let jsonList = []
                    for(let i = 0; i < carts.length; i++) {
                        let cartItems = await tables['CartItem'].findAll({where: {shoppingCartCartId: carts[i].cartId}})
                        let jsonListCartItems = []
                        for(let j = 0; j < cartItems.length; j++) {
                            let jsonCartItem = {}
                            jsonCartItem['itemCardID'] = cartItems[j].itemCardID
                            jsonCartItem['quantity'] = cartItems[j].quantity
                            jsonCartItem['productProductID'] = cartItems[j].productProductID
                            let product = await tables['Product'].findOne({where: {productID: cartItems[j].productProductID}})
                            jsonCartItem['product'] = product
                            jsonListCartItems.push(jsonCartItem)
                        }
                        let invoice = await tables['Invoice'].findOne({where: {shoppingCartCartId: carts[i].cartId, shopShopID: req.query.shopID}})
                        let json = {}
                        json['invoiceNumber'] = invoice.invoiceNumber
                        json['date'] = invoice.date
                        json['shop'] = shop
                        json['cart'] = carts[i]
                        json['cartItems'] = jsonListCartItems
                        jsonList.push(json)
                    }
                    res.status(200).json(jsonList)
                }
            } else {
                res.status(404).json({
                    Message: "User not found!",
                    statusCode: 404
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})

// get all invoices 
router.get('/invoice/get-all', async(req, res, next) => {
    try {
        if (req.query && req.query.email) {
            let client = await tables['Client'].findOne({where: {email: req.query.email}})
            if(client != null) {
                let carts = await tables['ShoppingCart'].findAll({where: {clientClientID: client.clientID}})
                if(carts == null) {
                    res.status(200).json([]);
                } else {
                    let jsonList = []
                    for(let i = 0; i < carts.length; i++) {
                        if(carts[i].totalToPay != 0){
                        let cartItems = await tables['CartItem'].findAll({where: {shoppingCartCartId: carts[i].cartId}})
                        let jsonListCartItems = []
                        for(let j = 0; j < cartItems.length; j++) {
                            let jsonCartItem = {}
                            jsonCartItem['itemCardID'] = cartItems[j].itemCardID
                            jsonCartItem['quantity'] = cartItems[j].quantity
                            jsonCartItem['productProductID'] = cartItems[j].productProductID
                            let product = await tables['Product'].findOne({where: {productID: cartItems[j].productProductID}})
                            jsonCartItem['product'] = product
                            jsonListCartItems.push(jsonCartItem)
                        }
                        let invoice = await tables['Invoice'].findOne({where: {shoppingCartCartId: carts[i].cartId}})
                        let shop = await tables['Shop'].findOne({where: {shopID: invoice.shopShopID}})
                        let json = {}
                        json['invoiceNumber'] = invoice.invoiceNumber + 1000
                        json['date'] = invoice.date
                        let jsonShop = {}
                        jsonShop['idShop'] = shop.shopID
                        jsonShop['CIF'] = shop.CIF
                        jsonShop['name'] = shop.name
                        jsonShop['location'] = shop.location

                        json['shop'] = jsonShop
                        let jsonCart = {}
                        jsonCart['idCart'] =  carts[i].cartId
                        jsonCart['totalToPay'] =  carts[i].totalToPay
                        jsonCart['totalProducts'] =  carts[i].totalProducts
                        jsonCart['clientClientID'] =  carts[i].clientClientID
                        jsonCart['cartItemList'] =  jsonListCartItems
                        json['cart'] = jsonCart
                        // json.cart['cartItems'] = jsonListCartItems
                        // json['cartItems'] = jsonListCartItems
                        jsonList.push(json)
                    }
                    }
                    res.status(200).json(jsonList)
                }
            } else {
                res.status(404).json({
                    Message: "User not found!",
                    statusCode: 404
                })
            }
        }
        else {
            res.status(400).json({
                Message: "Bad request",
                statusCode: 400
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json("Server error")
    }
})


//get all shops
router.get("/shops/get-all", async(req, res, next) => {
    try{
        await tables['Shop'].findAll().then(items => {
                let array = [];
                    for (var i = 0 ; i < items.length; i++) {
                        let jsonObj = {}
                        jsonObj['idShop'] = items[i].shopID
                        jsonObj['CIF'] = items[i].CIF
                        jsonObj['name'] = items[i].name
                        jsonObj['location'] = items[i].location
                        array.push(jsonObj)
                    }                    
                res.status(200).json( array);
        })
    }
    catch(error){
        console.warn(error)
        res.status(500).json("Server error")
    }
})

function validateCreditCardInfo(req) {
    return req.body.cardNumber && req.body.cardNumber !== null &&
        req.body.cardNumber !== '' &&
        req.body.cardType &&
        req.body.cardType !== null &&
        req.body.cardType !== '' &&
        req.body.validDate &&
        req.body.validDate != null &&
        req.body.validDate !== '' &&
        req.body.cardHolder &&
        req.body.cardHolder != null &&
        req.body.cardHolder !== '' &&
        req.body.CVV &&
        req.body.CVV != null &&
        req.body.CVV !== '';
}

module.exports = router
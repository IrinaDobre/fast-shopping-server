const Router = require("router")
const database = require("../database.js")
const router = Router()
const { sequelize } = require("../database.js");
const DataTypes = sequelize.DataTypes;
const tables = database.tables

const bcrypt = require('bcrypt');
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
            console.log("-------")
            console.log(req.query.email)
            let client = await tables.Client.findOne({ where: { email: req.query.email } })
            console.log("+_+_+_+_+_")
            console.log(client.email)
            if(client != null) {
                let creditCards = await tables.CreditCard.findAll({ where: { clientCliendID: client.cliendID } })
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
                    const cardNumberHash = bcrypt.hashSync(req.body.cardNumber, saltRounds);
                    const cardHolderHash = bcrypt.hashSync(req.body.cardHolder, saltRounds);
                    const CVVHash = bcrypt.hashSync(req.body.CVV.toString(), saltRounds);
                    await tables['CreditCard'].create({ 
                        cardNumber: cardNumberHash, 
                        cardType: req.body.cardType , 
                        validDate: req.body.validDate,
                        cardHolder: cardHolderHash,
                        CVV: CVVHash,
                        clientCliendID: client.cliendID
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


module.exports = router

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

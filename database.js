const Sequelize = require("sequelize")

const database = 'fastShoppingDB'
const username = 'root'
const password = '12345678'
const hostname = 'localhost'

const sequelize = new Sequelize(database, username, password, {
    host : hostname,
    dialect : 'mysql',
    pool: {
        max: 5,
        min: 0,
  }
})

const tables = {
    Client : require('./models/client')(sequelize),
    CreditCard: require('./models/creditCard')(sequelize),
    ShoppingList: require('./models/shoppingList')(sequelize),
    ShoppingListItem: require('./models/shoppingListItem')(sequelize),
    ShoppingCart: require('./models/shoppingCart')(sequelize),
    Invoice: require('./models/invoice')(sequelize),
    Shop: require('./models/shop')(sequelize),
    Product: require('./models/product')(sequelize),
    CartItem: require('./models/cartItem')(sequelize)
}

tables.Client.hasMany(tables.CreditCard);
tables.Client.hasMany(tables.ShoppingList);
tables.Client.hasMany(tables.ShoppingCart);
tables.ShoppingList.hasMany(tables.ShoppingListItem)
tables.ShoppingCart.hasOne(tables.Invoice)
tables.ShoppingCart.hasMany(tables.CartItem)
tables.Invoice.hasMany(tables.Shop)
tables.Shop.hasMany(tables.Product)
tables.Product.hasMany(tables.CartItem)

// mysql -u root -p
// 12345678
// use fastShoppingDB;
// show tables;

sequelize.sync()
    .then()
    .catch((error) => console.warn(error))
    
sequelize
    .authenticate()
    .then(() => {
        console.warn('Connection has been established successfully.')
    })
    .catch(error => {
        console.warn('Unable to connect to the database.',error)
    })
    
module.exports = {
    tables :tables,
    sequelize : sequelize
}
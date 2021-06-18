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
    Client : require('./models/Client')(sequelize),
    CreditCard: require('./models/CreditCard')(sequelize),
    ShoppingList: require('./models/ShoppingList')(sequelize),
    ShoppingListItem: require('./models/ShoppingListItem')(sequelize),
    ShoppingCart: require('./models/ShoppingCart')(sequelize),
    Invoice: require('./models/Invoice')(sequelize),
    Shop: require('./models/Shop')(sequelize),
    Product: require('./models/Product')(sequelize),
    CartItem: require('./models/CartItem')(sequelize),
    Voucher: require('./models/Voucher')(sequelize),
    ClientVoucher: require('./models/ClientVoucher')(sequelize),
}

tables.Client.hasMany(tables.CreditCard);
tables.Client.hasMany(tables.ShoppingList);
tables.Client.hasMany(tables.ShoppingCart);
tables.ShoppingList.hasMany(tables.ShoppingListItem)
tables.ShoppingCart.hasOne(tables.Invoice)
tables.ShoppingCart.hasMany(tables.CartItem)
tables.Shop.hasMany(tables.Invoice)
tables.Shop.hasMany(tables.Product)
tables.Shop.hasMany(tables.Voucher)
tables.Product.hasMany(tables.CartItem)
tables.Voucher.hasMany(tables.ClientVoucher)
tables.Client.hasMany(tables.ClientVoucher)


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
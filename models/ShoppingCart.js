const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const ShoppingCart = sequelize.define('shoppingCart', {
        itemID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        totalToPay : {
            type: Sequelize.DOUBLE,
            allowNull : false,
        },
        totalProducts : {
            type: Sequelize.INTEGER,
            allowNull : false
        }
    })
    return ShoppingCart
}
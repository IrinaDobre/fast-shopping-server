const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const ShoppingListItem = sequelize.define('shoppingListItem', {
        itemID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        itemName : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        quantity : {
            type: Sequelize.INTEGER,
            allowNull : false
        },
        unitType : {
            type: Sequelize.STRING(255),
            allowNull : false
        },
        bought : {
            type: Sequelize.STRING(255),
            allowNull: false
        }
    })
    return ShoppingListItem
}
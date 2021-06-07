const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const ShoppingList = sequelize.define('shoppingList', {
        shoppingListID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        numberOfItems : {
            type: Sequelize.INTEGER,
            allowNull : false
        },
        status : {
            type: Sequelize.INTEGER,
            allowNull : false
        }
    })
    return ShoppingList
}
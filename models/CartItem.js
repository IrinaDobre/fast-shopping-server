const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('cartItem', {
        itemCardID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity : {
            type: Sequelize.INTEGER,
            allowNull : false,
        }
    })
    return CartItem
}
const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        productID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        barcode : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        name : {
            type: Sequelize.STRING(255),
            allowNull : false
        },
        image : {
            type: Sequelize.STRING(255),
            allowNull : false
        },
        price : {
            type: Sequelize.DOUBLE,
            allowNull : false
        },
        TVA : {
            type: Sequelize.DOUBLE,
            allowNull : false
        },
        category : {
            type: Sequelize.STRING(30),
            allowNull : false
        }
    })
    return Product
}
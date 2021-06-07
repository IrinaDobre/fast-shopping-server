const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const Shop = sequelize.define('shop', {
        shopID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        CIF : {
            type: Sequelize.STRING(30),
            allowNull : false,
        },
        name : {
            type: Sequelize.STRING(255),
            allowNull : false
        },
        location: {
            type: Sequelize.STRING(255),
            allowNull: false
        }
    })
    return Shop
}
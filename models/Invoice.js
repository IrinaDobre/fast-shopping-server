const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('invoice', {
        itemID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            initialAutoIncrement:1000
        },
        date : {
            type: Sequelize.STRING(20),
            allowNull : false,
        }, 
    })
    return Invoice
}
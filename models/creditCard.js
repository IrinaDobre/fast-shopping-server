const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const CreditCard = sequelize.define('creditCard', {
        cardID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cardNumber : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        cardType : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        validDate : {
            type: Sequelize.STRING(10),
            allowNull : false,
        },
        cardHolder : {
            type: Sequelize.STRING(255),
            allowNull : false,
        },
        CVV : {
            type: Sequelize.STRING(255),
            allowNull : false,
        }
    })
    return CreditCard
}
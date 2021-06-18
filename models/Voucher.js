const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const Voucher = sequelize.define('voucher', {
        voucherId : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        value : {
            type: Sequelize.DOUBLE,
            allowNull : false,
        },
        startDate : {
            type: Sequelize.STRING(20),
            allowNull : false
        },
        endDate : {
            type: Sequelize.STRING(20),
            allowNull : false
        }
    })
    return Voucher
}
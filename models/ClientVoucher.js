const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const ClentVoucher = sequelize.define('clientVoucher', {
        userDate : {
            type: Sequelize.STRING(20),
            allowNull : false,
        }
    })
    return ClentVoucher
}
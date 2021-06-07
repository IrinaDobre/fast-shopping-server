const { DataTypes } = require('sequelize');

const { sequelize } = require("../database.js");
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('client', {
        cliendID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email : {
            type: Sequelize.STRING(255),
            allowNull : false,
            validate : {
                isEmail : true
            }
        },
        password : {
            type: Sequelize.STRING(255),
            allowNull : false
        },
        phoneNumber : {
            type: Sequelize.STRING(10),
            allowNull : false
        }
    })
    return Client
}
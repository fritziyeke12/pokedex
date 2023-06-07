const { db, Sequelize, Op } = require("./db");
const { Pokemon } = require("./Pokemon.js");
const { User } = require("./User.js");


module.exports = {
    db,
    Sequelize,
    Pokemon,
    User,
    Op
};
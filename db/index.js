const { db, Sequelize, Op } = require("./db.js");
const { Pokemon } = require("./Pokemon.js");


module.exports = {
    db,
    Sequelize,
    Pokemon,
    Op
};
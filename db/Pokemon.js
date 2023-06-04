const { db, Sequelize } = require("./db.js");

const Pokemon = db.define("Pokemon", {
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    rarity: Sequelize.STRING,
    region: Sequelize.STRING
});

module.exports = { Pokemon };
const { db, Sequelize } = require("./db.js");

const User = db.define("User", {
    name: Sequelize.STRING,
    nickname: Sequelize.STRING,
    email: Sequelize.STRING,
    region: Sequelize.STRING
});

module.exports = { User };
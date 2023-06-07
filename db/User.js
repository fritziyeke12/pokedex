const { db, Sequelize } = require("./db.js");

const User = db.define("User", {
    name: Sequelize.STRING,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    email: Sequelize.STRING,
    region: Sequelize.STRING,
    token: Sequelize.STRING
});

module.exports = { User };
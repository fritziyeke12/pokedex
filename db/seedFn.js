const { db } = require("./db.js");
const { Pokemon } = require("./Pokemon.js");
const { User } = require("./User.js");
const { pokémon, users } = require("./seedData.js");

const seed = async () => {
    await db.sync({force: true});//recreate db
    await Pokemon.bulkCreate(pokémon);
    await User.bulkCreate(users);
};

module.exports = seed;
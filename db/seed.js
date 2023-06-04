const { db } = require("./db.js");
const seed = require("./seedFn.js");

seed()
    .then(() => {
        console.log("Seeding successful");
    })
    .catch(error => {
        console.error(error)
    })
    .finally(() => {
        db.close();
    })
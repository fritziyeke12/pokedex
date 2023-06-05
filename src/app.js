const { auth } = require("express-openid-connect");
const express = require("express");
const app = express();
const { config } = require("../config/index.js");
const { Pokemon, Op } = require("../db");
// const {  } = require("sequelize");

app.set("json spaces", "\t")
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

//middleware


// req.isAuthenticated is provided from the auth router
app.get('/', async (req, res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged in" : 'Logged out');
    // console.log(req.oidc.accessToken);
    // console.log(req.oidc.user);
    // console.log(req.oidc.user.email);
});

//gets all pokemon
app.get("/pokedex", async (req, res, next) => {
    
    try {
        let poke = await Pokemon.findAll({attributes: ["name", "type", "rarity", "region"]});
        res.send(poke);
    } catch (error) {
        console.error(error);
        next();
    }
})

app.get("/pokedex/:name", async (req, res, next) => {
    const { name } = req.params;

    try {
        let poke = await Pokemon.findOne({attributes: ["name", "type", "rarity", "region"], where: {name: {[Op.substring]: `${name}`}}});
        res.send(poke);
    } catch (error) {
        console.error(error);
    }
})

module.exports = app;
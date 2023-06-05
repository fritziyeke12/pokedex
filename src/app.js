const { auth } = require("express-openid-connect");
const express = require("express");
const app = express();
const { config } = require("../config/index.js");
const { Pokemon, Op } = require("../db");
const { where } = require("sequelize");

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
        let poke = await Pokemon.findAll({attributes: ["id", "name", "type", "rarity", "region"]});
        res.send(poke);
    } catch (error) {
        console.error(error);
        next();
    }
})

//gets pokemon by name
app.get("/pokedex/:name", async (req, res, next) => {
    const { name } = req.params;

    try {
        let poke = await Pokemon.findOne({attributes: ["id", "name", "type", "rarity", "region"], where: {name: {[Op.substring]: `${name}`}}});
        res.send(poke);
    } catch (error) {
        console.error(error);
    }
})

//adds a new pokemon
app.post("/pokemon", async (req, res, next) => {
    const { name, type, rarity, region } = req.body;//destructures props

    try {
        let newPokemon = await Pokemon.create({name, type, rarity, region});
        res.status(201).send(newPokemon);
    } catch (error) {
        console.error(error);
    }
});

//updates an existing pokemon entirely by id
app.put("/pokemon/:id", async (req, res, next) => {
    const { name, type, rarity, region } = req.body;
    const { id } = req.params;

    try{
        await Pokemon.update({name, type, rarity, region},
            {where: {id}});
            res.status(200).send(await Pokemon.findByPk(id, {attributes: ["id", "name", "type", "rarity", "region"]}));
    }catch(error){
        console.error(error);
    }
});

//updates an individual prop of a pokemon by id
app.patch("/pokemon/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        await Pokemon.update(req.body, {where: {id}});
        res.status(200).send(await Pokemon.findByPk(id, {attributes: ["id", "name", "type", "rarity", "region"]}));
    } catch (error) {
        console.error(error);
    }
})

//deletes a pokemon by id
app.delete("/pokemon/delete/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        let pokemonToDelete = await Pokemon.findByPk(id);
        let copy = pokemonToDelete;
        await pokemonToDelete.destroy();
        console.log("Deleted:");
        console.log(copy);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
    }
})
module.exports = app;
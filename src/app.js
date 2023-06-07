const { auth } = require("express-openid-connect");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const { config } = require("../config/index.js");
const { Pokemon, User, Op } = require("../db");
const bcrypt = require("bcrypt");
const SALT = 5;

app.set("json spaces", "\t");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let authenticated = [
    "oakisdagoat@gmail.com",
    "birchtheprof@gmail.com",
    "juniperofunova@gmail.com",
    "sinnohdabest@gmail.com",
];

let currentUser;

app.post("/reg", async (req, res, next) => {
    const { name, username, password, email, region } = req.body;
    let conflictingUser = await User.findOne({ where: { username } });

    if (!name || !username || !password || !email || !region) {
        res.status(400).send("Name, username, password, email and region are required");
        return;
    }

    if (conflictingUser) {
        res.status(406).send("User already exists");
        return;
    }

    try {
        hashedPw = await bcrypt.hash(password, SALT);
        let newUser = await User.create({
            name,
            username,
            password: hashedPw,
            email,
            region,
        });

        let token = jwt.sign(
            { name, username, password: hashedPw, email, region },
            process.env.JWT_SECRET
        );

        newUser.update({ token });
        res.status(200).send("User Registered");

    } catch (error) {
        console.error(error);
    }
});

app.use((req, res, next) => {
    req.user = currentUser;
    next();
})

app.post("/signin/:username/:password", async (req, res, next) => {
    const { username, password } = req.params;
    let user = await User.findOne({ where: { username } });

    if (!user) {
        res.status(404).send("User Not Found");
        return;
    }

    if(req.user){
        res.status(200).send("Already signed in");
        return;
    }

    try {
        let isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.user = jwt.verify(user.token, process.env.JWT_SECRET);
            currentUser = req.user;
            res.status(200).send("Signed In");
            return;
        }

        res.status(401).send("Authentication Failed");
    } catch (error) {
        console.error(error);
    }
});

app.get("/signout", async (req, res, next) => {
    currentUser = undefined;
    res.status(204).send("Signed Out");
});

//middleware
app.use((req, res, next) => {
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    if (!authenticated.includes(req.user.email)) {
        res.sendStatus(401);
        return;
    }

    try {
        next();
    } catch (error) {
        console.error(error);
    }
});


//gets all pokemon
app.get("/pokedex", async (req, res, next) => {
    try {
        let poke = await Pokemon.findAll({
            attributes: ["id", "name", "type", "rarity", "region"],
        });
        res.send(poke);
    } catch (error) {
        console.error(error);
        next();
    }
});

//gets pokemon by name
app.get("/pokedex/:name", async (req, res, next) => {
    const { name } = req.params;

    try {
        let poke = await Pokemon.findOne({
            attributes: ["id", "name", "type", "rarity", "region"],
            where: { name: { [Op.substring]: `${name}` } },
        });
        res.send(poke);
    } catch (error) {
        console.error(error);
    }
});

//adds a new pokemon
app.post("/pokemon", async (req, res, next) => {
    const { name, type, rarity, region } = req.body; //destructures props
    let conflictingPokemon = await Pokemon.findOne({where: {name}});

    if(req.user.region != region){
        res.status(403).send(`Only Professors of the region ${region} are authorised to log the new Pokémon found there`);
        return;
    }

    if(conflictingPokemon){
        res.status(406).send("Sloppy mistake Professor, you've already logged this Pokémon!");
        return;
    }

    try {
        let newPokemon = await Pokemon.create({ name, type, rarity, region });
        res.status(201).send(newPokemon);
    } catch (error) {
        console.error(error);
    }
});

//updates an existing pokemon entirely by id
app.put("/pokemon/:id", async (req, res, next) => {
    const { name, type, rarity, region } = req.body;
    const { id } = req.params;

    if(req.user.region != region){
        res.status(403).send(`Only Professors of the region ${region} are authorised to alter the details of the Pokémon found there`);
        return;
    }

    try {
        await Pokemon.update({ name, type, rarity, region }, { where: { id } });
        res.status(200).send(
            await Pokemon.findByPk(id, {
                attributes: ["id", "name", "type", "rarity", "region"],
            })
        );
    } catch (error) {
        console.error(error);
    }
});

//updates an individual prop of a pokemon by id
app.patch("/pokemon/:id", async (req, res, next) => {
    const { id } = req.params;
    let pokemonToUpdate = await Pokemon.findByPk(id);

    if(!pokemonToUpdate){
        res.status(404).send("No such Pokémon is logged in the Pokedex");
        return;
    }

    if(req.user.region != pokemonToUpdate.region){
        res.status(403).send(`Only Professors of the region ${region} are authorised to alter the details of the Pokémon found there`);
        return;
    }

    try {
        await pokemonToUpdate.update(req.body, { where: { id } });
        res.status(200).send(
            await Pokemon.findByPk(id, {
                attributes: ["id", "name", "type", "rarity", "region"],
            })
        );
    } catch (error) {
        console.error(error);
    }
});

//deletes a pokemon by id
app.delete("/pokemon/delete/:id", async (req, res, next) => {
    const { id } = req.params;
    let pokemonToDelete = await Pokemon.findByPk(id);

    if(!pokemonToDelete){
        res.status(404).send("No such Pokémon is logged in the Pokedex");
        return;
    }

    if(req.user.region != pokemonToDelete.region){
        res.status(403).send(`Only Professors of the region ${region} are authorised to delete entries of the Pokémon found there`);
        return;
    }

    try {
        let copy = pokemonToDelete;
        await pokemonToDelete.destroy();
        // console.log("Deleted:");
        // console.log(copy);
        res.status(204).send("Pokémon entry deleted");
    } catch (error) {
        console.error(error);
    }
});
module.exports = app;

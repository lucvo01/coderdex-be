var express = require("express");
var router = express.Router();
const fs = require("fs");

/* GET all pokemons listing. */
router.get("/", function (req, res, next) {
  //input validation
  const allowedFilter = ["Name", "Type1", "Type2"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery.key) delete filterQuery.key;
    });

    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;
    //Filter data by title
    let result = [];

    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            )
          : pokemons.filter(
              (pokemon) => pokemon[condition] === filterQuery[condition]
            );
      });
    } else {
      result = pokemons;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

/* GET a pokemon together with the previous and next pokemon information.. */
router.get("/:id", function (req, res, next) {
  //put input validation
  try {
    const pokemonId = parseInt(req.params.id);

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { pokemons } = db;

    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemonId === pokemon.id
    );

    if (targetIndex < 0) {
      const error = new Error("Pokemon not found");
      error.statusCode = 401;
      throw error;
    }

    const lastIndex = pokemons.length - 1;
    let previousIndex = targetIndex - 1;
    let nextIndex = targetIndex + 1;

    if (targetIndex === lastIndex) {
      nextIndex = 0;
    }
    if (targetIndex === 0) {
      previousIndex = lastIndex;
    }

    const pokemon = pokemons[targetIndex];
    const previousPokemon = pokemons[previousIndex];
    const nextPokemon = pokemons[nextIndex];

    const result = {
      pokemon,
      previousPokemon,
      nextPokemon
    };

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// API for creating new Pokémon
router.post("/", function (req, res, next) {
  try {
    const { Name, Type1, Type2, id } = req.body;
    if (!Name || !Type1) {
      const error = new Error("Missing body info");
      error.statusCode = 401;
      throw error;
    }

    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);

    const { pokemons } = db;

    const newPokemon = { Name, Type1, Type2, id: pokemons.length + 1 };

    db.pokemons.push(newPokemon);

    // db.pokemons = pokemons;
    fs.writeFileSync("pokemons.json", JSON.stringify(db));

    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

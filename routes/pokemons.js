const { error, debug } = require("console");
var express = require("express");
var router = express.Router();
const fs = require("fs");
const { type } = require("os");

/* GET all data listing. */
router.get("/", function (req, res, next) {
  //input validation
  const allowedFilter = ["name", "type", "search", "id"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    console.log("filterKeys", filterKeys);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const error = new Error(`Query ${key} is not allowed`);
        error.statusCode = 401;
        throw error;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    //Filter data by title
    let result = [];

    if (filterKeys.length) {
      // filterKeys.forEach((key) => {
      //   result = result.length
      //     ? result.filter((pokemon) => pokemon[key] === filterQuery[key])
      //     : data.filter((pokemon) => pokemon[key] === filterQuery[key]);
      // });
      // console.log("result1", result);
      if (filterQuery.type) {
        const searchQuery = filterQuery.type.toLowerCase();
        console.log(searchQuery);
        result = data.filter((pokemon) => pokemon.type.includes(searchQuery));
      }

      if (filterQuery.search) {
        const searchQuery = filterQuery.search.toLowerCase();
        console.log("searchQuery", searchQuery);
        result = data.filter((pokemon) => {
          return (
            pokemon.name.includes(searchQuery) ||
            pokemon.id.includes(searchQuery)
          );
        });
      }
    } else {
      result = data;
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

    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    const targetIndex = data.findIndex((pokemon) => pokemonId === pokemon.id);

    if (targetIndex < 0) {
      const error = new Error("Pokemon not found");
      error.statusCode = 401;
      throw error;
    }

    const lastIndex = data.length - 1;
    let previousIndex = targetIndex - 1;
    let nextIndex = targetIndex + 1;

    if (targetIndex === lastIndex) {
      nextIndex = 0;
    }
    if (targetIndex === 0) {
      previousIndex = lastIndex;
    }

    const pokemon = data[targetIndex];
    const previousPokemon = data[previousIndex];
    const nextPokemon = data[nextIndex];

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
    const { Name, Type, id } = req.body;
    if (!Name || !Type) {
      const error = new Error("Missing body info");
      error.statusCode = 401;
      throw error;
    }
    if (Type.length > 2) {
      const error = new Error("Pokémon can only have one or two types.");
      error.statusCode = 401;
      throw error;
    }

    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    const allTypes = [];
    data.forEach((pokemon) => allTypes.push(...pokemon.Type));

    if (!Type.every((element) => allTypes.includes(element))) {
      const error = new Error("Pokémon's type is invalid.");
      error.statusCode = 401;
      throw error;
    }
    data.forEach((pokemon) => {
      if (Name === pokemon.Name || id === pokemon.id) {
        const error = new Error("The Pokémon already exists.");
        error.statusCode = 401;
        throw error;
      }
    });

    const newPokemon = { Name, Type, id: data.length + 1 };

    db.data.push(newPokemon);

    fs.writeFileSync("data.json", JSON.stringify(db));

    res.status(200).send(newPokemon);
  } catch (error) {
    next(error);
  }
});

//  API for updating a Pokémon
router.put("/:id", function (req, res, next) {
  try {
    const allowUpdate = ["Name", "Type"];

    const pokemonId = parseInt(req.params.id);
    const updates = req.body;
    const updateKeys = Object.keys(updates);

    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const error = new Error(`Update field not allow`);
      error.statusCode = 401;
      throw error;
    }

    //put processing
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);
    const data = db.data;

    //find pokemon by id
    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);

    if (targetIndex < 0) {
      const error = new Error(`Pokemon not found`);
      error.statusCode = 404;
      throw error;
    }

    //Update new content to db book JS object
    const updatedPokemon = { ...db.data[targetIndex], ...updates };

    //write and save to db.json
    fs.writeFileSync("data.json", JSON.stringify(db));

    //put send response
    res.status(200).send(updatedPokemon);
  } catch (error) {
    next(error);
  }
});

// API for deleting a Pokémon by Id
router.delete("/:id", function (req, res, next) {
  try {
    const pokemonId = parseInt(req.params.id);

    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);

    const targetIndex = db.data.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );

    if (targetIndex < 0) {
      const error = new Error("Pokemon not found");
      error.statusCode = 401;
      throw error;
    }
    console.log(pokemonId);
    console.log(targetIndex);

    db.data = db.data.filter((pokemon) => pokemon.id !== pokemonId);

    fs.writeFileSync("data.json", JSON.stringify(db));

    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;

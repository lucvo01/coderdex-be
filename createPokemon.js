const { faker } = require("@faker-js/faker");
const { parse } = require("dotenv");

const createPokemon = (numberOfPokemons) => {
  if (!numberOfPokemons) {
    console.log("please input number");
    return;
  }
  numberOfPokemons = parseInt(numberOfPokemons);
  console.log("Creating pokemons");

  for (let i = 0; i < numberOfPokemons; i++) {
    const pokemon = {
      Name: faker.name.firstName(),
      Type1: faker.name.email()
    };
  }
};

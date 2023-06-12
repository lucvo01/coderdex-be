const fs = require("fs");
const csv = require("csvtojson");

const createProduct = async () => {
  const imageFiles = fs.readdirSync("./images");

  let newData = await csv().fromFile("pokemon.csv");

  //   Filter data to only get pokemons that have corresponding images
  newData = newData.filter((pokemon) => {
    const imageName = pokemon.Name + ".png";
    return imageFiles.includes(imageName);
  });

  //   Add an id for every pokemon
  newData = newData.map((pokemon, index) => {
    return { ...pokemon, id: index + 1 };
  });

  // Combine Type1 & Type2 into one Type array
  newData = newData.filter((pokemon) => {
    pokemon.Type = [pokemon.Type1, pokemon.Type2].filter(Boolean);
    delete pokemon.Type1;
    delete pokemon.Type2;
    return { ...pokemon };
  });

  let data = JSON.parse(fs.readFileSync("pokemons.json", "utf-8"));
  data.pokemons = newData;

  fs.writeFileSync("pokemons.json", JSON.stringify(data));
};

createProduct();

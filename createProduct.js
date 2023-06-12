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

  let data = JSON.parse(fs.readFileSync("pokemons.json", "utf-8"));
  data.pokemons = newData;

  fs.writeFileSync("pokemons.json", JSON.stringify(data));
};

createProduct();

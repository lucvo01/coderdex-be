const fs = require("fs");
const csv = require("csvtojson");

const createProduct = async () => {
  const imageFiles = fs.readdirSync("./images");
  // console.log(imageFiles);
  let newData = await csv().fromFile("pokemon.csv");

  //   Filter data to only get pokemons that have corresponding images
  newData = newData.filter((pokemon) => {
    const imageName = pokemon.Name + ".png";
    return imageFiles.includes(imageName);
  });

  let urlData = JSON.parse(fs.readFileSync("urlData.json", "utf-8"));

  const urlList = urlData.url;

  newData = newData.map((pokemon, index) => {
    const url = urlList.find((url) => {
      return url.includes(pokemon.Name);
    });

    const transformedPokemon = {
      ...pokemon,
      id: (index + 1).toString(),
      url: url,
      name: pokemon.Name,
      types: [pokemon.Type1, pokemon.Type2]
        .filter(Boolean)
        .map((type) => type.toLowerCase())
    };

    delete transformedPokemon.Name;
    delete transformedPokemon.Type1;
    delete transformedPokemon.Type2;

    return transformedPokemon;
  });

  let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
  data.data = newData;

  fs.writeFileSync("data.json", JSON.stringify(data));
};

createProduct();

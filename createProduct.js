const fs = require("fs");
const csv = require("csvtojson");
const { url } = require("inspector");

const createProduct = async () => {
  const imageFiles = fs.readdirSync("./images");
  // console.log(imageFiles);
  let newData = await csv().fromFile("pokemon.csv");

  //   Filter data to only get pokemons that have corresponding images
  newData = newData.filter((pokemon) => {
    const imageName = pokemon.Name + ".png";
    return imageFiles.includes(imageName);
  });

  // Create url for each image
  const cloudinary = require("cloudinary").v2;
  // Configure Cloudinary with your credentials
  cloudinary.config({
    cloud_name: "dx3cu4deo",
    api_key: "649228862156515",
    api_secret: "tp0C0m1ZKvlU1gVP2R0wKbu-E3E"
  });

  let urlList = [];
  imageFiles.forEach(async (item) => {
    // Upload an image
    try {
      const response = await cloudinary.uploader.upload(`./images/${item}`, {
        public_id: item.slice(0, -4)
      });
      const imageUrl = response.secure_url;
      // console.log(imageUrl);
      urlList.push(imageUrl);
    } catch (error) {
      console.log(error);
    }
  });
  console.log("urlList", urlList);

  newData = newData.map((pokemon, index) => {
    // const url = `./images/${pokemon.Name}.png`;
    const url = urlList.find((url) => {
      url.includes(pokemon.Name);
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

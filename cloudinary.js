const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const imageFiles = fs.readdirSync("./images");

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dx3cu4deo",
  api_key: "649228862156515",
  api_secret: "tp0C0m1ZKvlU1gVP2R0wKbu-E3E",
  timeout: 60000
});

let urlList = [];

const uploadImages = async () => {
  for (const item of imageFiles) {
    try {
      const response = await cloudinary.uploader.upload(`./images/${item}`, {
        public_id: item.slice(0, -4)
      });
      const imageUrl = response.secure_url;
      urlList.push(imageUrl);
      console.log(urlList);
    } catch (error) {
      console.log(error);
    }
  }

  let data = JSON.parse(fs.readFileSync("urlData.json", "utf-8"));
  data.url = urlList;

  fs.writeFileSync("urlData.json", JSON.stringify(data));
};

uploadImages();

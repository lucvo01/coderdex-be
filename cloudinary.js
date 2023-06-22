// import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./config.js";

const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const imageFiles = fs.readdirSync("./images");
// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dx3cu4deo",
  api_key: "649228862156515",
  api_secret: "tp0C0m1ZKvlU1gVP2R0wKbu-E3E"
});

const urlList = [];

imageFiles.forEach(async (item) => {
  // Upload an image
  try {
    const response = await cloudinary.uploader.upload(`./images/${item}`, {
      public_id: item.slice(0, -4)
    });
    const imageUrl = response.secure_url;
    // console.log(imageUrl);
    // return imageUrl;
    urlList.push(imageUrl);
  } catch (error) {
    console.log(error);
  }
});
console.log("urlList", urlList);

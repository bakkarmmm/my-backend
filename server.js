import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "development" ? ".env.development" : ".env";

dotenv.config({ path: envFile });

console.log("Using ENV file:", envFile);
import app from "./app.js";
import "./db.js"; // just to connect to MongoDB
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// console.log(process.env.JWT_SECRET);
app.listen(3000, () => {
  console.log("server running on port 3000");
});

import mongoose from "mongoose";
import Bussnise from "./modelus/Busninss.js";

const mongoURI =
  "mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/Catalog?retryWrites=true&w=majority&appName=Catalog";

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function setDefaultLocations() {
  try {
    const bussnises = await Bussnise.find({
      $or: [{ location: { $exists: false } }, { "location.coordinates": { $size: 0 } }],
    });

    console.log(`Found ${bussnises.length} businesses without location.`);

    for (const biz of bussnises) {
      biz.location = {
        type: "Point",
        coordinates: [35.5018, 33.8938], // بيروت افتراضياً
      };
      await biz.save();
      console.log(`✅ Updated location for business: ${biz.name}`);
    }

    console.log("All missing locations updated successfully!");
  } catch (err) {
    console.error("Error updating locations:", err);
  }
}

async function main() {
  await connectDB();
  await setDefaultLocations();
  await mongoose.disconnect(); // فصل الاتصال بعد كل العمليات
  process.exit(0);
}

main();
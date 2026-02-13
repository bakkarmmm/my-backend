import mongoose from "mongoose";
import type from "./modelus/BusninssTpye.js";
import Plans from "./modelus/Plans.js";
import Bussnise from "./modelus/Busninss.js"
import Subscription from "./modelus/Subscription.js"
import Item from "./modelus/item.js";
import Paymant from "./modelus/Paymant.js";
import Users from "./modelus/Users.js";
import Category from "./modelus/Category.js";
import Busninss from "./modelus/Busninss.js";

// await mongoose.connect("mongodb://localhost:27017/Catalog");
// const data = await LocalModel.find();
// await mongoose.connect("mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/?appName=Catalog")
const mongoURI = "mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/Catalog?retryWrites=true&w=majority&appName=Catalog";

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully!");
    console.log("Connected to DB:", mongoose.connection.name);
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log("MongoDB disconnected");
    });
    
    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if connection fails
  }
}

connectDB();
// await OnlineModel.insertMany(data);
// Business Type
// const types = await type.create({
//   name: "caffeShop",
//   layout: "viewModern",
// });


// const Plan = await Plans.create({
//   name: "Premium",
//   price: 70,
//   durationDys: 30,
//   features: ["Orders", "Menu","test","unlimitud categories","unlimitud storge"],
// });
//ITEM
// const Item = await Item.create({
  
// });
// Business
// const business = await Bussnise.create({
//   name: "Test Restaurant",
//   bussnisOwner: new mongoose.Types.ObjectId(), // مؤقت
//   slug: "test-restaurant",
  
//   type: types._id,
//   disc: "Test description",
//   isActive: true,
//   contact: "71682819",
//   theme: {
//     bottomColor: "#00A63E",
//   },
// });

// Subscription
// await Subscription.create({
//   busId: new mongoose.Types.ObjectId("696021b94ef4a836e2067599"),
//   planId: new mongoose.Types.ObjectId("695ed824b6f6175921ac7d67"),
//   startDate: new Date(),
//   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
//   paidAmount: 50,
// });
// const addRatingToOldBussnises = async () => {
//   await mongoose.connect("mongodb://localhost:27017/Catalog");// عدل اسم DB

  const result = await Busninss.updateMany(
    { }, // فقط المستندات التي لا تحتوي rating
    { $set: {
          openTime: "09:00",  // الوقت الافتراضي اللي بدك
          closeTime: "18:00",
        },}         // أضف الحقل بالقيمة الافتراضية
  );
  // const update = await Bussnise.updateMany(
  //   {}, // فقط المستندات التي لا تحتوي rating
  //   { $unset: { isActive: "" } }         // أضف الحقل بالقيمة الافتراضية
  // );
//   const bussninsObjectId = new mongoose.Types.ObjectId(
//   "695ed8764019938f1cd74d65"
// );
// const newPaymant = new Paymant({
//       bussninsId: bussninsObjectId,
//        subsId: bussninsObjectId,
//       receiptImage:"image",
//      status:"PENDING"
//     })
//     await newPaymant.save();
// //   console.log("Updated documents:", result.modifiedCount);
//   mongoose.disconnect();
// };
// addRatingToOldBussnises();
console.log(result)
console.log("Seed data inserted");

process.exit();

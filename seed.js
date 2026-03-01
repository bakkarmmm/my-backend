// import mongoose from "mongoose";
// import Item from "./modelus/item.js";
// import Category from "./modelus/Category.js";
// // عدّل المسار حسب مشروعك


// async function updateItems() {
//   try {
//     const result = await Category.updateMany(
//       { bussninsId: { $exists: false } }, // فقط اللي ما عندها bussnins_id
//       { $set: { bussninsId: bussninsObjectId } }
//     );

//     console.log("Updated items:", result.modifiedCount);
//   } catch (error) {
//     console.error(error);
//   }
// }
// mongoose
//   .connect("mongodb://localhost:27017/Catalog")
//   .then(async () => {
//     await updateItems();
//     process.exit();
//   });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./modelus/Users.js";
import Paymant from "./modelus/Paymant.js";

// 🔗 اتصال بقاعدة البيانات
mongoose.connect("mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/Catalog")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error ❌", err));
const addUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);
    const user = await User.create({
      name: "yousef",
      password: hashedPassword,
      role: "bussnisOwner",
      phone: "70123456",
    });
    console.log("User added successfully ✅");
    console.log(user);
    process.exit();
  } catch (error) {
    console.error("Error adding user ❌", error.message);
    await mongoose.disconnect();
  }
};

addUser();

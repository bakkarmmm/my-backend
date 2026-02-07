// migrateUsers.js
import mongoose from "mongoose";
import User from "./modelus/Users.js"; // عدّل المسار حسب مشروعك

async function migrateUsers() {
  try {
    // 1️⃣ اتصال local
    const localConn = await mongoose.createConnection(
      "mongodb://localhost:27017/Catalog",
      { dbName: "Catalog" }
    );

    // 2️⃣ اتصال online (MongoDB Atlas)
    const onlineConn = await mongoose.createConnection(
      "mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/Catalog",
      { dbName: "Catalog" }
    );

    // 3️⃣ استيراد الموديل لكل قاعدة
    const LocalUser = localConn.model("User", User.schema);
    const OnlineUser = onlineConn.model("User", User.schema);

    // 4️⃣ جلب كل البيانات مع كلمة السر
    const usersData = await LocalUser.find().select("+password").lean();

    if (!usersData.length) {
      console.log("⚠️ No users to migrate");
      process.exit(0);
    }

    // 5️⃣ إزالة _id القديم للسماح لـ MongoDB Atlas بإنشاء ObjectId جديد
    const sanitizedData = usersData.map(({ _id, ...rest }) => rest);

    // 6️⃣ إدراجها في Atlas
    await OnlineUser.insertMany(sanitizedData, { ordered: false });
    console.log(`✅ Migrated ${sanitizedData.length} users successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateUsers();

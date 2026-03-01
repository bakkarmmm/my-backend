import mongoose from "mongoose";
import typeModel from "./modelus/BusninssTpye.js";
import Plans from "./modelus/Plans.js";
import Bussnise from "./modelus/Busninss.js";
import Subscription from "./modelus/Subscription.js";
import Item from "./modelus/item.js";
import Paymant from "./modelus/Paymant.js";
import Users from "./modelus/Users.js";
import Category from "./modelus/Category.js";

async function migrate() {
  try {
    // 1️⃣ الاتصال بالـ Mongo المحلي
    const localConn = await mongoose.createConnection("mongodb://localhost:27017/Catalog");
    console.log("✅ Connected to local MongoDB");

    // 2️⃣ الاتصال بالـ Mongo Atlas
    const onlineUri = "mongodb+srv://mounirabdbakkar_db_user:qM2r3BjX3NsCHWur@catalog.skqhxcg.mongodb.net/Catalog";
    const onlineConn = await mongoose.createConnection(onlineUri, { serverSelectionTimeoutMS: 30000 });
    console.log("✅ Connected to MongoDB Atlas");

    // 3️⃣ تعريف الموديلات على كل اتصال
    const models = [
      { name: "type", model: typeModel },
      { name: "plans", model: Plans },
      { name: "bussnise", model: Bussnise },
      { name: "subscription", model: Subscription },
      { name: "item", model: Item },
      { name: "paymant", model: Paymant },
      { name: "users", model: Users },
      { name: "category", model: Category },
    ];

    for (const m of models) {
      console.log(`\n🔹 Migrating ${m.name}...`);

      const Local = localConn.model(m.name, m.model.schema);
      const Online = onlineConn.model(m.name, m.model.schema);

      const data = await Local.find().lean();

      if (data.length === 0) {
        console.log(`⚠️ No data found in ${m.name}`);
        continue;
      }

      await Online.insertMany(data, { ordered: false });
      console.log(`✅ ${data.length} documents migrated for ${m.name}`);
    }

    console.log("\n🎉 Migration completed successfully!");
    await localConn.close();
    await onlineConn.close();
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

migrate();

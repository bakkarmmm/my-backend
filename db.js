import mongoose from "mongoose";

// MongoDB Atlas connection string with database name
// Replace 'your_database_name' with your actual database name
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
export default mongoose;

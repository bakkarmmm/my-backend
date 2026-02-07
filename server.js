// import 'dotenv/config'; // Load environment variables
import app from "./app.js";
import './db.js'; // just to connect to MongoDB
import dotenv from "dotenv";
dotenv.config();
app.listen(3000, ()=>{
    console.log("server running on port 3000"); 
})
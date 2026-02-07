import mongoose from "mongoose";
const BusninssTypeSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        layout:{
            type:String,
            required: true,
        },
        disc:{
            type:String,
            required: true,
        }
    },
  
    { timestamps: true }
)
export default mongoose.model("Type",BusninssTypeSchema);
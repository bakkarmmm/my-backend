import mongoose from "mongoose";
const PlansSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required: true,
        },
        price:{
            type:Number,
            required: true,
        },
        durationDys:{
            type:Number,
            required: true,
        },
        features:{
            type:[String],
            default:[]
        },
        isActive:{
            type: Boolean,
            default: true,
        }
    },
  
    { timestamps: true }
)
export default mongoose.model("Plan",PlansSchema);
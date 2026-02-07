import mongoose from "mongoose";
const bussnisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bussnisOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    disc: {
      type: String,
      
    },
    adrres: {
      type: String,
      default:"akkar",
      required: true,
    },
    
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REJECTED","CLOSED"],
      default:"PENDING"
    },
    contact: {
      type: String,
      required: true,
    },
    theme: {
      bottomColor: {
        type: String,
        required: true,
        default:"#00A63E",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bussnise", bussnisSchema);

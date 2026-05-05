import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    bussninsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bussnise",
      required: true,
    },
    order: { type: Number, index: true }
    
  },

  { timestamps: true },
); 

const Category = mongoose.model("Category", categorySchema);
categorySchema.index(
  { name: 1, bussninsId: 1 },
  { unique: true }
);
export default Category;

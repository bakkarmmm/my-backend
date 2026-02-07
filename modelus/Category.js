import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // الاسم إجباري ويجب أن يكون فريد
    isActive:{type:Boolean,required: true,default: true},
    bussninsId:{type: mongoose.Schema.Types.ObjectId,
      ref: "Bussnise",
      required: false,}
  },
  { timestamps: true }
); // يحفظ createdAt و updatedAt تلقائيًا

const Category = mongoose.model("Category", categorySchema);

export default Category;

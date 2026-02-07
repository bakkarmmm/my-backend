import mongoose from "mongoose";

const subDiscSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  text: { type: String, required: false },
});

const itemSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // تأكد من تحويل السعر Number عند الإدخال
    discription: { type: String },

    // الحقل القديم (مثلاً رقم أو اسم) – خليه بشكل مؤقت أثناء المايغريشن
    // gategory: { type: Number, required: true },

    // الحقل الجديد لربط الـ Item بالـ Category عن طريق ObjectId
    gategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false, // خليه optional أثناء المايغريشن، بعدين تقدر تخليه required
    },
    subDisc: [subDiscSchema],
    ResturantSlug: { type: String },
    bussnins_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bussnise",
      required: false,
    },
    isActive:{
      type: Boolean,
      required:true,
      default:true,
    }
  },
  { timestamps: true }
); // يحفظ createdAt و updatedAt تلقائياً

const Item = mongoose.model("Item", itemSchema);

export default Item;

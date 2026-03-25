import mongoose from "mongoose";

const subDiscSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  text: { type: String, required: false },
});

const itemSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discription: { type: String },
    gategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subDisc: [subDiscSchema],
    ResturantSlug: { type: String },
    bussnins_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bussnise",
      required: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    avalible: {
      type: Boolean,
      required: true,
      default: true,
    },
    public_id: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Item = mongoose.model("Item", itemSchema);
itemSchema.index({ name: 1, bussnins_id: 1 }, { unique: true });
export default Item;

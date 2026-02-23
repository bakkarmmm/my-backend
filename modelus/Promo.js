import mongoose from "mongoose";

const PromoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    disc: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    bussninsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bussnise",
      required: false,
    },
    public_id: {
      type: String,
    },
  },
  { timestamps: true },
);

const Promo = mongoose.model("Promo", PromoSchema);

export default Promo;

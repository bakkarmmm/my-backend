import mongoose from "mongoose";
const bussnisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bussnisOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    disc: {
      type: String,
    },
    logoImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    adrres: {
      type: String,
      default: "akkar",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REJECTED", "CLOSED"],
      default: "PENDING",
    },
    contact: {
      type: String,
      required: true,
    },

    theme: {
      type: String,
      required: true,
      default: "#00A63E",
    },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "18:00" },
  },
  { timestamps: true },
);

export default mongoose.model("Bussnise", bussnisSchema);

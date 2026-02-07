import mongoose from "mongoose";
import paymant from "./Paymant.js";
const SubscriptionSchema = new mongoose.Schema(
    {
        busId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Bussnise",
            required: true,
        },
        planId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Plan",
            required: true,
        },
        startDate:{
            type: Date,
            required: true,
        },
        endDate:{
            type: Date,
            required: true,
        },
        status:{
            type: String,
            enum:["active","expired","canceled","pending"],
            default:"pending",
        },
        paidAmount:{
            type: Number,
            required: true
        }


    },{timestamps:true}
);

SubscriptionSchema.virtual("payment", {
  ref: "paymant",          // اسم الموديل
  localField: "_id",       // Subscription._id
  foreignField: "subsId",  // Paymant.subsId
  justOne: true,           // بدنا object مش array
});
SubscriptionSchema.set("toObject", { virtuals: true });
SubscriptionSchema.set("toJSON", { virtuals: true });
export default mongoose.model("Subscription",SubscriptionSchema)
import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Busninss from "../modelus/Busninss.js";
import Subscription from "../modelus/Subscription.js";
import multer from "multer";
import paymant from "../modelus/Paymant.js";
import Plans from "../modelus/Plans.js";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
const router = express.Router();

export const getOwnerSubscription = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const business = await Busninss.findOne({ bussnisOwner: ownerId });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const subsc = await Subscription.findOne({ busId: business._id }).populate(
      "planId",
      "name price",
    );
    if (!subsc) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.json(subsc);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const revuveSubsc = async (req, res) => {
  console.log("OK")
  try {
    const { PlanId, busId } = req.body;
    const receiptImage = req.file?.filename;
    const pendingRenew = await paymant.findOne({
      busId,
      status: "PENDING",
      type: "RENEW",
    });
    console.log("OK")
    if (pendingRenew) {
      return res.status(400).json({
        message: "You already have a pending renewal request.",
      });
    }
    console.log("OK")
    const findSub = await Subscription.findOne({ busId }).select("_id");
    if (!PlanId || !busId || !receiptImage) {
      return res.status(400).json({ message: "Missing required fields" });
    }
   
    console.log("OK")
    const findPlan = await Plans.findById(PlanId);
    const newPaymant = new paymant({
      bussninsId: busId,
      subsId: findSub,
      receiptImage: receiptImage,
      requestedPlanId:PlanId,
      status: "PENDING",
      type: "RENEW",
      amount:findPlan.price,
    });
    console.log("OK5")
    await newPaymant.save();
    // const updateSubscripation = await Subscription.findByIdAndUpdate(
    //   findSub,
    //   { $set: { planId: PlanId,paidAmount: findPlan.price} },
    //   { new: true },
    // );
    console.log(newPaymant)
    res.json("is accepted please await for court time");
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
router.get("/ownerSubsc", protect, getOwnerSubscription);
router.post("/renew", upload.single("image"), protect, revuveSubsc);
export default router;

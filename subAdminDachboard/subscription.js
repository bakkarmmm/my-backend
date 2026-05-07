import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Busninss from "../modelus/Busninss.js";
import Subscription from "../modelus/Subscription.js";
import multer from "multer";
import paymant from "../modelus/Paymant.js";
import Plans from "../modelus/Plans.js";
import sendNotification from "../sendNotification.js";
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
  limits: { fileSize: 10 * 1024 * 1024 },
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
  
  try {
    console.log(req.body);
    const { PlanId, busId,receiptImage } = req.body || {};
    console.log(PlanId);
    console.log(busId);
    console.log(receiptImage);
    // const receiptImage = req.file?.filename;
    const pendingRenew = await paymant.findOne({
      busId,
      status: "PENDING",
      type: "RENEW",
    });
    console.log("OK");
    if (pendingRenew) {
      return res.status(400).json({
        message: "You already have a pending renewal request.",
      });
    }
    console.log("OK");
    const findSub = await Subscription.findOne({ busId }).select("_id");
    if (!PlanId || !busId || !receiptImage) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    console.log("OK");
    const findPlan = await Plans.findById(PlanId);
    const newPaymant = new paymant({
      bussninsId: busId,
      subsId: findSub,
      receiptImage: receiptImage,
      requestedPlanId: PlanId,
      status: "PENDING",
      type: "RENEW",
      amount: findPlan.price,
    });
    console.log("OK5");
    await newPaymant.save();
    console.log(newPaymant);
   
    const business = await Busninss.findById(busId).select("name");
    await sendNotification(`
💲 *New Payment Alert*

━━━━━━━━━━━━━━━
🧾 ID: ${newPaymant._id}
🏬 Store: ${business.name}

💵 Amount: ${newPaymant.amount}
⚡ Status: ${newPaymant.status}

🖼️ Receipt: ${newPaymant.receiptImage ? "✅ Uploaded" : "❌ Missing"}

🕒 ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━
`);
 res.json("is accepted please await for court time");
  } catch (error) {
    res.status(500).json({ message: "Server error" })
    console.log(error)
  }
};

router.get("/ownerSubsc", protect, getOwnerSubscription);
router.post("/renew", protect, revuveSubsc);

export default router;

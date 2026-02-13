import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Paymant from "../modelus/Paymant.js";
import Busninss from "../modelus/Busninss.js";
import Subscription from "../modelus/Subscription.js";

const router = express.Router();

export const getPaymanets = async (req, res) => {
  try {
    const all = await Paymant.find()
      .select("status createdAt receiptImage type amount")
      .populate({
        path: "bussninsId",
        select: "name",
      })
      .populate({
        path: "subsId",
        select: "paidAmount",
        populate: { path: "planId", select: "name" },
      }).populate({path:"requestedPlanId",select:"name price"});
    res.json(all);
    console.log(all);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const accepted = async (req, res) => {
  try {
    console.log("ok");
    const { bussninsId, subsId, Payid } = req.body;
    const updateBussnise = await Busninss.findByIdAndUpdate(
      bussninsId,
      { $set: { status: "ACTIVE" } },
      { new: true },
    );
    const updateSubs = await Subscription.findByIdAndUpdate(
      subsId,
      { $set: { status: "active" } },
      { new: true },
    );
    const updatePaymant = await Paymant.findByIdAndUpdate(
      Payid,
      { $set: { status: "APPROVED" } },
      { new: true },
    );
    
    const subscription = await Subscription.findById(subsId).populate("planId");
    if (updatePaymant.requestedPlanId) {
      subscription.planId = updatePaymant.requestedPlanId;
      await subscription.populate("planId"); // جلب بيانات الخطة الجديدة
    }
    subscription.startDate = new Date();
    subscription.endDate = new Date(
      Date.now() + subscription.planId.durationDys * 24 * 60 * 60 * 1000,
    );
    await subscription.save();
    res.json("is accepted this requeste");
  } catch (error) {
    res.status(500).json(error);
  }
};
export const rejected = async (req, res) => {
  try {
    const { bussninsId, subsId, Payid } = req.body;

    // 1️⃣ تحديث حالة الدفع إلى REJECTED
    await Paymant.findByIdAndUpdate(
      Payid,
      { $set: { status: "REJECTED" } },
      { new: true }
    );

    const subscription = await Subscription.findByIdAndUpdate(
      subsId,
      { $set: { status: "expired" } },
      { new: true }
    );

    res.json({ message: "Payment rejected" });
  } catch (error) {
    res.status(500).json(error);
  }
};

router.get("/allPaymants", getPaymanets);
router.put("/acceptedPaymant", accepted);
router.put("/rejectedPaymant", rejected);
export default router;

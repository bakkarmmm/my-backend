import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Paymant from "../modelus/Paymant.js";
import Busninss from "../modelus/Busninss.js";
import Subscription from "../modelus/Subscription.js";
import Notification from "../modelus/Notification.js";
import sendNotification from "../sendNotification.js";
import Users from "../modelus/Users.js";

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
      })
      .populate({ path: "requestedPlanId", select: "name price" });
    res.json(all);
    console.log(all);
  } catch (error) {
    res.status(500).json(error);
  }
};
export const accepted = async (req, res) => {
  try {
    const { bussninsId, subsId, Payid } = req.body;
    const admin = await Users.findById(req.user.id).select("name");
    const businessOwner = await Busninss.findById(bussninsId)
      .select("bussnisOwner name phone")
      .populate("bussnisOwner", "name");
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
    const notification = {
      userId: businessOwner.bussnisOwner,
      type: "accepted renew",
      title: "Accepted your Payment",
      message: "Welcome back in your Store dachboard",
      link: "/dachboard/Subscription",
    };
    const newNotification = new Notification(notification);
    await newNotification.save();

    await sendNotification(`
✅ *Payment Approved*

━━━━━━━━━━━━━━━
🏬 Store: ${businessOwner.name}
👑 Owner: ${businessOwner.bussnisOwner.name}
📞 ${businessOwner.bussnisOwner.phone || "Not provided"}

💵 Amount: ${updatePaymant.amount}
📦 Plan: ${subscription.planId.name || "Updated Plan"}

👤 Admin: ${admin.name}
⚡ Status: ${updateBussnise.status}

🕒 ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━
`);
    res.json("is accepted this requeste");
  } catch (error) {
    res.status(500).json(error);
  }
};
export const rejected = async (req, res) => {
  try {
    const admin = await Users.findById(req.user.id).select("name");
    const { bussninsId, subsId, Payid } = req.body;
    const businessOwner = await Busninss.findById(bussninsId)
      .select("bussnisOwner name phone")
      .populate("bussnisOwner", "name");
    // 1️⃣ تحديث حالة الدفع إلى REJECTED
    const updatePaymant =await Paymant.findByIdAndUpdate(
      Payid,
      { $set: { status: "REJECTED" } },
      { new: true },
    );
    const subscription = await Subscription.findById(subsId);

    const now = new Date();
    if (subscription.endDate < now) {
      // انتهى الاشتراك → وضعه كـ "expired"
      subscription.status = "expired";
      await subscription.save();
    }
    const notification = {
      userId: businessOwner.bussnisOwner,
      type: "rejected ted renew",
      title: "rejected your Payment",
      message: "Your renewal request was rejected. Please contact admin.",
      link: "/dachboard/Subscription",
    };
    const newNotification = new Notification(notification);
    await newNotification.save();
    await sendNotification(`
❌ *Payment Rejected*

━━━━━━━━━━━━━━━
🏬 Store: ${businessOwner.name}
👑 Owner: ${businessOwner.bussnisOwner.name}
📞 ${businessOwner.bussnisOwner.phone || "Not provided"}

💵 Amount: ${updatePaymant.amount || 0}
📦 Plan: ${subscription?.planId?.name || "N/A"}

👤 Admin: ${admin.name}
⚡ Status: REJECTED

🕒 ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━
`);
    res.json({ message: "Payment rejected" });
  } catch (error) {
    res.status(500).json(error);
  }
};

router.get("/allPaymants", getPaymanets);
router.put("/acceptedPaymant", protect, accepted);
router.put("/rejectedPaymant", protect, rejected);
export default router;

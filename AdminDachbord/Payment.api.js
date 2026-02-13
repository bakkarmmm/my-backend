import express from "express";
import { protect } from "../midlware/auth.js";
import Users from "../modelus/Users.js";
import Busninss from "../modelus/Busninss.js";
import Paymant from "../modelus/Paymant.js";
const router = express.Router();

export const getPayment = async (req, res) => {
  console.log("ok");
  try {
    const busnisse = await Busninss.find({ bussnisOwner: req.user.id }).select(
      "_id",
    );
    console.log(busnisse);
    const PaymanetHistory = await Paymant.find({ bussninsId: busnisse }).sort({ createdAt: -1 })
      .populate({
        path: "subsId",
        select: "name",
        populate: { path: "planId", select: "name price" },
      })
      .populate({ path: "requestedPlanId", select: "name" });
    console.log(PaymanetHistory);
    res.json(PaymanetHistory);
  } catch (error) {
    res.status(500).json(error);
  }
};
router.get("/historyPaymant", protect, getPayment);
export default router;

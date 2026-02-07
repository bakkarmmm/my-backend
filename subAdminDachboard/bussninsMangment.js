import express from "express";

import Bussnise from "../modelus/Busninss.js";
import Type from "../modelus/BusninssTpye.js";

import { protect } from "../midlware/auth.js";
import Subscription from "../modelus/Subscription.js";
import mongoose from "mongoose";
import Plans from "../modelus/Plans.js";
import slugify from "slugify";
import Busninss from "../modelus/Busninss.js";
import Paymant from "../modelus/Paymant.js";
import Item from "../modelus/item.js";
import Category from "../modelus/Category.js";
const router = express.Router();

export const getBussnines = async (req, res) => {
  try {
    const data = await Subscription.find()
      .select("status startDate endDate")
      .populate({
        path: "busId",
        select:
          "name bussnisOwner type status theme contact adrres disc createdAt",
        populate: [
          { path: "bussnisOwner", select: "name" },
          { path: "type", select: "name" },
        ],
      })
      .populate({
        path: "planId",
        select: "name price",
      })
      .populate({
        path: "payment",
        select: "status receiptImage createdAt",
      });

    console.log(data);
    res.json(data);
  } catch (error) {
    res.json(error);
  }
};
export const insert = async (req, res) => {
  try {
    const {
      name,
      bussnisOwner,
      type,
      planId,
      disc,
      addres,
      status,
      contact,
      theme,
    } = req.body;
    console.log(req.body);
    const newBussnise = new Bussnise({
      name: name,
      bussnisOwner: bussnisOwner,
      slug: slugify(name, { lower: true }),
      type: type,
      disc: disc,
      adrres: addres,
      status: "PENDING",
      contact: contact,
      theme: theme,
    });
    await newBussnise.save();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const plan = await Plans.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    const newSubscription = new Subscription({
      busId: newBussnise._id,
      planId,
      startDate,
      endDate,
      paidAmount: plan.price,
      status: status,
    });

    await newSubscription.save();
    res.status(201).json({
      message: "Business created successfully",
      data: { bussnise: newBussnise, subscription: newSubscription },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating business",
      error: error.message,
    });
  }
};
export const updateStatus = async (req, res) => {
  // console.log("ok");
  // try {
  //   const id = req.params.id;
  //   const { status } = req.body;
  //   const update = await Bussnise.findByIdAndUpdate(
  //     id,
  //     { $set: { status: status } },
  //     { new: true },
  //   );
  //   res.json("accepted Update ...");
  // } catch (error) {
  //   res.status(400).json({
  //     message: "not update",
  //     error: error,
  //   });
  // }
};
export const deleteBussnines = async (req, res) => {
  console.log("ok");
  const id = req.params.id;

  try {
    const Delete = await Bussnise.findByIdAndDelete(id);
    const spsc = await Subscription.deleteMany({ busId: req.params.id });
    const prd = await Item.deleteMany({ bussnins_id: id });
    const delC = await Category.deleteMany({ bussninsId: id });

    res.json({ message: "Business and all related data deleted" });
  } catch (error) {
    res.status(400).json({
      message: "not update",
      error: error,
    });
  }
};
export const updateBussnise = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      planId,
      status,
      name,
      bussnisOwner,
      type,
      contact,
      adrres,
      disc,
      theme,
    } = req.body;

    const bussnise = await Bussnise.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(name && { name }),
          ...(bussnisOwner && { bussnisOwner }),
          ...(type && { type }),
          ...(contact && { contact }),
          ...(adrres && { adrres }),
          ...(disc && { disc }),
          ...(theme && { theme }),
        },
      },
      { new: true },
    );
    if (!bussnise) {
      return res.status(404).json({ message: "Bussnise not found" });
    }
    let subscription = await Subscription.findOne({ busId: id });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (typeof status === "string") {
      subscription.status = status;
    }

    console.log("ok1");

    console.log("ok2");
    if (planId && subscription.planId.toString() !== planId) {
      if (!mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({ message: "Invalid planId" });
      }

      const plan = await Plans.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      subscription.planId = planId;
      subscription.startDate = new Date();
      subscription.endDate = new Date(
        Date.now() + plan.durationDys * 24 * 60 * 60 * 1000,
      );
      subscription.paidAmount = plan.price;
    }

    await subscription.save();

    res.json({
      message: "Bussnise & Subscription updated successfully",
      bussnise,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const accetedOrRgected = async (req, res) => {
  console.log(req.body);

  try {
    const id = req.params.id;
    const status = req.body.status;

    const updateb = await Busninss.findByIdAndUpdate(
      id,
      {
        $set: { status },
      },
      { new: true },
    );
    const subscription = await Subscription.findOne({ busId: id }).populate(
      "planId",
    );
    const updateS = await subscription.updateOne(
      { _id: subscription._id },
      {
        $set: {
          status: status === "ACTIVE" ? "active" : "canceled",
          paidAmount: status === "ACTIVE" ? subscription.planId.price : 0,
        },
      },
    );
    const updatePayment = await Paymant.updateOne(
      { bussninsId: id },
      { $set: { status: status === "ACTIVE" ? "APPROVED" : "REJECTED" } },
    );

    console.log("done !");
    res.json("is accpeted account ...");
  } catch (error) {
    res.status(500).json(error);
  }
};
router.get("/allbussnise", protect, getBussnines);
router.post("/insert", protect, insert);
router.put("/updateStatus/:id", protect, updateStatus);
router.delete("/delete/:id", protect, deleteBussnines);
router.put("/update/:id", protect, updateBussnise);
router.put("/acceptedOrRejected/:id", protect, accetedOrRgected);
export default router;

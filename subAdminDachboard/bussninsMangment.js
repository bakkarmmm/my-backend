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
      status: "ACTIVE",
      contact: contact,
      theme: theme,
    });
    const existingBusiness = await Bussnise.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingBusiness) {
      return res.status(400).json({
        message: "Business name already exists. Please choose another name.",
      });
    }
    if (existingBusiness) {
      return res.status(400).json({
        message: "Business name already exists. Please choose another name.",
      });
    }
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
      status: "active",
    });

    await newSubscription.save();

    const payment = new Paymant({
      bussninsId: newBussnise._id,
      subsId: newSubscription._id,
      status: "APPROVED",
      type: "ADMIN",
      amount: 0,
      receiptImage: null,
    });
    await payment.save();
    res.status(201).json({
      message: "Business created successfully",
      data: { bussnise: newBussnise, subscription: newSubscription },
    });
  } catch (error) {
    console.log(error);
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
    const subscriptionStatusMap = {
      PENDING: "pending",
      ACTIVE: "active",
      REJECTED: "canceled",
      CLOSED: "canceled",
    };
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
    console.log(req.body);
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
          ...(status && { status }),
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
      const upperStatus = status.toUpperCase();
      subscription.status = subscriptionStatusMap[upperStatus];
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
    console.log(error);
    res.status(500).json({
      message: "Error creating business",
      error: error.message,
    });
  }
};
export const accetedOrRgected = async (req, res) => {
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
export const GenraleInforamtion = async (req, res) => {
  try {

    const now = new Date();

    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const percent = (current, previous) => {
      if (previous === 0) return 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const stats = await Bussnise.aggregate([
      {
        $facet: {

          // كل البزنس
          totals: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],

          // هذا الشهر
          thisMonth: [
            {
              $match: {
                createdAt: { $gte: startThisMonth }
              }
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],

          // الشهر الماضي
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startLastMonth,
                  $lte: endLastMonth
                }
              }
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const totals = stats[0].totals;
    const thisMonth = stats[0].thisMonth;
    const lastMonth = stats[0].lastMonth;

    const getCount = (arr, status) =>
      arr.find((i) => i._id === status)?.count || 0;

    const allACTIVE = getCount(totals, "ACTIVE");
    const allPENDING = getCount(totals, "PENDING");
    const allREJECTED = getCount(totals, "REJECTED");
    const allCLOSED = getCount(totals, "CLOSED");

    const thisMonthACTIVE = getCount(thisMonth, "ACTIVE");
    const lastMonthACTIVE = getCount(lastMonth, "ACTIVE");

    const thisMonthPENDING = getCount(thisMonth, "PENDING");
    const lastMonthPENDING = getCount(lastMonth, "PENDING");

    const thisMonthREJECTED = getCount(thisMonth, "REJECTED");
    const lastMonthREJECTED = getCount(lastMonth, "REJECTED");

    const thisMonthCLOSED = getCount(thisMonth, "CLOSED");
    const lastMonthCLOSED = getCount(lastMonth, "CLOSED");

    const allCount =
      allACTIVE + allPENDING + allREJECTED + allCLOSED;
    const thisMonthAll = thisMonth.reduce((sum, i) => sum + i.count, 0);
const lastMonthAll = lastMonth.reduce((sum, i) => sum + i.count, 0);
const allCountPercent = percent(thisMonthAll, lastMonthAll);
    res.json({
      allCount,
      allACTIVE,
      allPENDING,
      allREJECTED,
      allCLOSED,
      allCountPercent : percent(thisMonthAll, lastMonthAll),
      activePercent: percent(thisMonthACTIVE, lastMonthACTIVE),
      pendingPercent: percent(thisMonthPENDING, lastMonthPENDING),
      rejectedPercent: percent(thisMonthREJECTED, lastMonthREJECTED),
      closedPercent: percent(thisMonthCLOSED, lastMonthCLOSED)
    });

  } catch (error) {
    res.status(500).json(error);
  }
};
export const BusinessGrowth = async (req, res) => {
  try {
    const now = new Date();
    const startYear = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Aggregation: نحسب عدد البزنس المنشأة كل شهر
    const growth = await Bussnise.aggregate([
      {
        $match: {
          createdAt: { $gte: startYear } // آخر 12 شهر
        }
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format البيانات للـ frontend
    const formatted = growth.map(item => {
      const month = item._id.month.toString().padStart(2, "0");
      return {
        month: `${item._id.year}-${month}`, // مثال: 2026-03
        count: item.count
      };
    });

    res.json(formatted);

  } catch (error) {
    res.status(500).json(error);
  }
};
export const getStatusCounts = async(req,res)=>{
  try {
    const result = await Subscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // صياغة النتيجة كـ array
    const formatted = result.map(r => ({
      status: r._id,
      count: r.count
    }));

    res.json({ formatted }); // الآن formatted هو array
  } catch (err) {
    res.status(501).json(err);
    console.error(err);
  }
}
router.get("/GenraleInforamtion",protect, GenraleInforamtion);
router.get("/getStatusCounts",protect, getStatusCounts);
router.get("/BusinessGrowth",protect, BusinessGrowth);
router.get("/allbussnise", protect, getBussnines);
router.post("/insert", protect, insert);
router.put("/updateStatus/:id", protect, updateStatus);
router.delete("/delete/:id", protect, deleteBussnines);
router.put("/update/:id", protect, updateBussnise);
router.put("/acceptedOrRejected/:id", protect, accetedOrRgected);
export default router;

import express from "express";

import Bussnise from "../modelus/Busninss.js";
import Type from "../modelus/BusninssTpye.js";
import { protect } from "../midlware/auth.js";
import multer from "multer";
import slugify from "slugify";
import Subscription from "../modelus/Subscription.js";
import Paymant from "../modelus/Paymant.js";
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
export const getMyBussnises = async (req, res) => {
  try {
    const bussnises = await Bussnise.find({
      bussnisOwner: req.user.id, // ✅ من JWT
    }).populate({ path: "type", strictPopulate: false });
    res.json(bussnises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyBussnise = async (req, res) => {
  try {
    const { name, type, disc, contact, address } = req.body;
    //console.log(req.body)
    const updated = await Bussnise.findOneAndUpdate(
      { bussnisOwner: req.user.id }, // 🔐 صاحب البزنس
      {
        name,
        type,
        disc,
        contact,
        address,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({
      message: "Business updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const registerBussnise = async (req, res) => {
  try {
    const { name, type, contact, plan } = req.body;
    const image = req.file ? req.file.filename : null;
    const findPlan = await Plans.findById(plan)
    if (!req.file) {
      return res.status(400).json({
        message: "Receipt image is required",
      });
    }
   
    console.log(image);
    console.log(req.body);
    const newBussnise = new Bussnise({
      name: name,
      bussnisOwner: req.user.id,
      slug: slugify(name, { lower: true }),
      type: type,
      contact: contact,
    });

    await newBussnise.save();
    
    console.log(newBussnise);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const newSubscription = new Subscription({
      busId: newBussnise._id,
      planId: plan,
      startDate,
      endDate,
      paidAmount: plan.price,
      status: "pending",
    });
    console.log("Before saving subscription:", newSubscription);
    try {
      await newSubscription.save();
      console.log("Subscription saved successfully:", newSubscription);
    } catch (subError) {
      console.error("Error saving subscription:", subError);
      return res.status(500).json({ message: "Failed to save subscription", error: subError.message });
    }
     const exist = await Paymant.findOne({
      subsId: newSubscription._id,
      status: "PENDING",
    });

    if (exist) {
      return res.status(400).json({
        message: "There is already a pending payment for this subscription",
      });
    }
    console.log(newSubscription);
    const newPaymant = new Paymant({
      bussninsId: newBussnise._id,
      subsId: newSubscription._id,
      receiptImage: image,
      status: "PENDING",
    });
    console.log("Before saving payment:", newPaymant);
    try {
      await newPaymant.save();
      console.log("Payment saved successfully:", newPaymant);
    } catch (saveError) {
      console.error("Error saving payment:", saveError);
      return res.status(500).json({ message: "Failed to save payment", error: saveError.message });
    }
    console.log(newPaymant);
    res.json(
      "your business registered successfully please contact admin to activate it",
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const checkMyBussnise = async (req, res) => {
  try {
    const bussnise = await Bussnise.findOne({
      bussnisOwner: req.user.id,
    });
    if(!bussnise){
      return res.json({
        hasBusiness: false,
        status: null,
      })
    }
    res.json({
      hasBusiness: true,
      status: bussnise.status, // ACTIVE | PENDING | REJECTED
      businessId: bussnise._id,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
router.get("/dachboard/my", protect, getMyBussnises);
router.put("/update", protect, updateMyBussnise);
router.get("/check", protect, checkMyBussnise);
router.post("/addBussnise", protect, upload.single("image"), registerBussnise);
export default router;

import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";

const router = express.Router();

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(400).json(error);
  }
};
export const addPlan = async (req, res) => {
  try {
    const { name, price, features } = req.body;
    const lines = features
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const newPlan = await Plan.create({
      name: name,
      price: price,
      features: lines,
      durationDys: 30,
    });
    res.json("accepted creation ...");
  } catch (error) {
    res.status(500).json(error);
  }
};
export const UpdatePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, features } = req.body;
    const lines = features
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const updateData = {
      name,
      price,
      lines,
    };
    const update = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    res.json("accepted updatet ...");
  } catch (error) {
    res.status(500).json(error);
  }
};
export const deletePlans = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const deletePlan = await Plan.findByIdAndDelete({ _id: id });
    res.json("succes delete this plan ... ");
  } catch (error) {
    res.status(500).json(error);
  }
};
router.get("/getPlans", protect, getPlans);
router.post("/addPlan", protect, addPlan);
router.put("/updatePlan/:id", protect, UpdatePlan);
router.delete("/deletePlan/:id", protect, deletePlans);
export default router;

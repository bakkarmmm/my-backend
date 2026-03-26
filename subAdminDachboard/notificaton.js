import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Notification from "../modelus/Notification.js";

const router = express.Router();

export const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments();
    const notifications = await Notification.find()
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const hasMore = skip + notifications.length < total;

    res.json({ notifications, hasMore });
  } catch (error) {
    res.status(400).json(error);
  }
};
export const sendNotification = async (req, res) => {
    console.log(req.body)
  try {
    const { isGlobal, userId, title, message, type, link } = req.body;
    if (!title || !message || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!isGlobal && !userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const notification = await Notification.create({
      isGlobal,
      userId: isGlobal ? null : userId,
      title,
      message,
      type,
      link,
    });

    res.status(201).json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    res.status(504).json(error);
  }
};
router.get("/getNotifications", protect, getNotifications);
router.post("/createNotification", protect, sendNotification);
export default router;

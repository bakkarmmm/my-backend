import express from "express";
import { protect } from "../midlware/auth.js";
import Users from "../modelus/Users.js";
import Notification from "../modelus/Notification.js";
const router = express.Router();

export const notification = async (req, res) => {
  
  try {
    const notifications = await Notification.find({ $or: [
    { userId: req.user.id },  // إشعارات المستخدم
    { isGlobal: true }        // إشعارات عامة
  ] })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};
export const ReadNotifaciton = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err)
  }
};
router.get(" ", protect, notification);
router.put("/read/:id", protect, ReadNotifaciton);
// router.put("/UpdateUser", protect, updateUserInforamtion);
export default router;

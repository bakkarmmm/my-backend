import express from "express";
import { protect } from "../midlware/auth.js";
import Users from "../modelus/Users.js";
const router = express.Router();

const getUserById = async (req, res) => {
  try {
    const findUser = await Users.findById(req.user.id).select("name phone");
    res.json(findUser);
  } catch (error) {
    res.status(500).json(error);
  }
};
const updateUserInforamtion = async (req, res) => {
    console.log(req.body)
  try {
    const updateData = req.body;
    const updateUser = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true },
    );
    console.log("updateData")
    console.log(updateUser)
    res.json("Saved Updated")
  } catch (error) {
    res.status(500).json(error)
  }
};
router.get("/pofile", protect, getUserById);
router.put("/UpdateUser", protect, updateUserInforamtion);
export default router;

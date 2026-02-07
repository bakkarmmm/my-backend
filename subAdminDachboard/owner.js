import express, { application } from "express";
import User from "../modelus/Users.js";
import { protect } from "../midlware/auth.js";
import Busninss from "../modelus/Busninss.js";
import bcrypt from "bcryptjs";
const router = express.Router();

export const getAllOwner = async (req, res) => {
  try {
    const owners = await User.find({ role: "bussnisOwner" }).select("_id name");
    res.status(200).json(owners);
  } catch (error) {
    res.status(404).json(error);
  }
};
export const getAllownerBussnines = async (req, res) => {
  try {
    const users = await User.find({ role: "bussnisOwner" }).select(
      "name phone isActive createdAt"
    );
    const userwithBusiness = await Promise.all(
      users.map(async (user) => {
        const business = await Busninss.findOne({
          bussnisOwner: user._id,
        }).select("name");
        return {
          ...user.toObject(),
          business,
        };
      })
    );
    res.json(userwithBusiness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const adduser = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const role = "bussnisOwner";
    const hashedPassword = await bcrypt.hash(password, 10);
    const newOwner = await User.create({
      name: name,
      phone: phone,
      password: hashedPassword,
      role: role,
    });

    res.json("accepted created ...");
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
const delteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const DeleteUser = await User.findByIdAndDelete(id);
    res.json("accepted delete this User account ...");
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
export const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const update = await User.findByIdAndUpdate(
      id,
      { $set: { isActive: status } },
      { new: true }
    );
    res.json("accepted Update ...");
  } catch (error) {
    res.status(400).json({
      message: "not update ...",
      error: error,
    });
  }
};
export const update = async (req, res) => {
   console.log("ok")
  try {
    const id = req.params.id;
    const { name, phone } = req.body;
    const update = await User.findByIdAndUpdate(
      id,
      { $set: { name, phone } },
      { new: true }
    );
    res.json("finish Update ...")
  } catch (error) {
    res.status(400).json(error)
  }
};
router.get("/allowners", protect, getAllOwner);
router.get("/userswithBusiness", protect, getAllownerBussnines);
router.post("/addnewOwner", protect, adduser);
router.delete("/deleteUser/:id", protect, delteUser);
router.put("/updateStatus/:id", protect, updateStatus);
router.put("/updateUser/:id",protect,update)
export default router;

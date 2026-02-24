import express from "express";
import Item from "../modelus/item.js";
import Category from "../modelus/Category.js";
import Busninss from "../modelus/Busninss.js";
import { protect } from "../midlware/auth.js";
import Promo from "../modelus/Promo.js";
import { v2 as cloudinary } from "cloudinary";
const router = express.Router();

export const getPromo = async (req, res) => {
  try {
    const owneriD = req.user.id;
    const bussise = await Busninss.findOne({ bussnisOwner: owneriD });
    const GetPromo = await Promo.find({ bussninsId: bussise._id });
    // console.log(GetPromo)
    res.json(GetPromo);
  } catch (error) {
    res.status(501).json(error);
    console.log(error);
  }
};
export const addPromo = async (req, res) => {
  const owner_id = req.user.id;
  const { name, disc, price, url, public_id } = req.body;
  try {
    const bussnise = await Busninss.findOne({ bussnisOwner: owner_id });
    if (!bussnise) {
      return res.status(404).json({ message: "Business not found" });
    }
    const newPromo = Promo.create({
      name: name,
      disc: disc,
      price: price,
      url: url,
      public_id: public_id,
      bussninsId: bussnise._id,
    });

    res.json("added ... ");
  } catch (error) {
    res.status(501).json(error);
    console.log(error);
  }
};
export const UpdatePromo = async (req, res) => {
  const id = req.params.id;
  try {
    const { name, disc, price, url, public_id } = req.body;
    const findPromo = await Promo.findById(id);
    if (!findPromo) {
      return res.status(404).json("Promo not found");
    }
    const updateData = {
      name: name,
      disc: disc,
      price: price,
    };
    if (url && public_id) {
      if (findPromo.public_id) {
        await cloudinary.uploader.destroy(findPromo.public_id);
      }
      updateData.url = url;
      updateData.public_id = public_id;
    }
    const update = await Promo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    res.json("product is updateed");
  } catch (error) {
    res.status(501).json(error);
  }
};
export const deletePromo = async (req, res) => {
  try {
    const id = req.params.id;
    const findPromo = await Promo.findById(id);
    if (!findPromo) {
      return res.status(404).json("Promo not found");
    }
    if (findPromo.public_id) {
      await cloudinary.uploader.destroy(findPromo.public_id);
    }
    await Promo.findByIdAndDelete(id);
    res.json("succufully delete this Promo");
  } catch (error) {
    res.status(501).json(error);
  }
};
export const updateStatus = async (req, res) => {
  const id = req.params.id;
  try {
    const findPromo = await Promo.findById(id);
    if (!findPromo) {
      return res.status(404).json("Promo not found");
    }
    const update = await Promo.findByIdAndUpdate(
      id,
      { $set: {isActive : !findPromo.isActive} },
      { new: true },
    );
    res.json("product is updateed");
  } catch (error) {
    res.status(501).json(error);
  }
};
router.get("/getPromo", protect, getPromo);
router.post("/addPromo", protect, addPromo);
router.put("/updatePromo/:id", protect, UpdatePromo);
router.put("/updateStatus/:id", protect, updateStatus);
router.delete("/deletePromo/:id", protect, deletePromo);
export default router;

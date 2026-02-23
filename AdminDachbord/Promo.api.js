import express from "express";
import Item from "../modelus/item.js";
import Category from "../modelus/Category.js";
import Busninss from "../modelus/Busninss.js";
import { protect } from "../midlware/auth.js";
import Promo from "../modelus/Promo.js";
const router = express.Router();

export const getPromo = async (req, res) => {
  try {
     const owneriD =  req.user.id;
    const bussise = await Busninss.findOne({ bussnisOwner: owneriD });
    const GetPromo = await Promo.find({ bussninsId: bussise._id });
    // console.log(GetPromo)
    res.json(GetPromo);
  } catch (error) {
    res.status(501).json(error);
    console.log(error)
  }
};
router.get("/getPromo",protect, getPromo);
export default router;

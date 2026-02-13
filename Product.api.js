import express from "express";
import Item from "./modelus/item.js";
import Category from "./modelus/Category.js";
import Busninss from "./modelus/Busninss.js";
const router = express.Router();


router.get("/:resturantSlug", async (req, res) => {
  const { resturantSlug } = req.params;
  try {
    const items = await Item.find({ ResturantSlug: resturantSlug });
    const categoriesIds = await Item.find({
      ResturantSlug: resturantSlug,
    }).distinct("gategoryID"); // يرجع array من ObjectId
    const restaurantName = items.length > 0 ? items[0].ResturantSlug : null;
    const categories = await Category.find({ _id: { $in: categoriesIds } });
    const bussnise = await Busninss.find({slug:resturantSlug})
    res.json({
      menu: items,
      categris: categories,
      RestaurantNames: restaurantName,
      bussnise : bussnise
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import Item from "./modelus/item.js";
import Category from "./modelus/Category.js";
import Busninss from "./modelus/Busninss.js";
const router = express.Router();

router.get("/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findById(id).populate({
      path: "gategoryID",
      select: "name",
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/:resturantSlug", async (req, res) => {
  const { resturantSlug } = req.params;
  try {
    const resturant = await Busninss.findOne({ slug: resturantSlug });
    const items = await Item.find({ bussnins_id: resturant._id }).populate({
      path: "gategoryID",
      select: "name",
    });
    const categoriesIds = await Item.find({
      bussnins_id: resturant._id,
    }).distinct("gategoryID");
    const restaurantName = items.length > 0 ? items[0].ResturantSlug : null;
    const categories = await Category.find({ _id: { $in: categoriesIds } });
    const bussnise = await Busninss.find({ slug: resturantSlug }).populate({
      path: "type",
      select: "name",
    });
    res.json({
      menu: items,
      categris: categories,
      RestaurantNames: restaurantName,
      bussnise: bussnise,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import Item from "./modelus/item.js";
import Category from "./modelus/Category.js";
import Busninss from "./modelus/Busninss.js";
import Promo from "./modelus/Promo.js";
const router = express.Router();

router.get("/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findById(id).populate({
      path: "gategoryID",
      select: "name",
    }).populate({path:"bussnins_id",select:"contact theme slug"});
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json(error);
  }
});
// router.get("/:resturantSlug", async (req, res) => {
//   const { resturantSlug } = req.params;
//   try {
//     const resturant = await Busninss.findOne({ slug: resturantSlug });
//     const items = await Item.find({ bussnins_id: resturant._id }).populate({
//       path: "gategoryID",
//       select: "name",
//     });
//     const Promos = await Promo.find({ bussninsId: resturant._id ,isActive:true});
//     const categoriesIds = await Item.find({
//       bussnins_id: resturant._id,
//     }).distinct("gategoryID");
//     const restaurantName = items.length > 0 ? items[0].ResturantSlug : null;
//     const categories = await Category.find({ _id: { $in: categoriesIds },isActive:true }).sort({ order: 1 });
//     const bussnise = await Busninss.find({ slug: resturantSlug }).populate({
//       path: "type",
//       select: "name",
//     });
//     res.json({
//       menu: items,
//       categris: categories,
//       RestaurantNames: restaurantName,
//       bussnise: bussnise,
//       Promos:Promos
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
router.get("/:resturantSlug", async (req, res) => {
  const { resturantSlug } = req.params;
  const page = parseInt(req.query.page) || 1;  // الصفحة الحالية
  const limit = parseInt(req.query.limit) || 10; // عدد المنتجات لكل صفحة
  const skip = (page - 1) * limit;

  try {
    const resturant = await Busninss.findOne({ slug: resturantSlug });
    if(!resturant) return res.status(404).json({ message: "Restaurant not found" });

    const totalItems = await Item.countDocuments({ bussnins_id: resturant._id });

    const items = await Item.find({ bussnins_id: resturant._id })
      .populate({ path: "gategoryID", select: "name" })
      .skip(skip)
      .limit(limit);

    const Promos = await Promo.find({ bussninsId: resturant._id ,isActive:true});

    const categoriesIds = await Item.find({
      bussnins_id: resturant._id,
    }).distinct("gategoryID");

    const restaurantName = items.length > 0 ? items[0].ResturantSlug : null;

    const categories = await Category.find({ _id: { $in: categoriesIds }, isActive:true }).sort({ order: 1 });

    const bussnise = await Busninss.find({ slug: resturantSlug }).populate({
      path: "type",
      select: "name",
    });

    res.json({
      menu: items,
      categris: categories,
      RestaurantNames: restaurantName,
      bussnise: bussnise,
      Promos: Promos,
      total: totalItems, // عدد المنتجات الكلي
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;

import express from "express";
import Item from "./modelus/item.js";
import Category from "./modelus/Category.js";
import Busninss from "./modelus/Busninss.js";
import Promo from "./modelus/Promo.js";
const router = express.Router();
router.get("/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Item.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate({
        path: "gategoryID",
        select: "name",
      })
      .populate({ path: "bussnins_id", select: "contact theme slug" });
    // await Item.findByIdAndUpdate(
    //   id,
    //   { $inc: { views: 1 } },
    //   { new: true },
    // );
    if (!item) return res.status(404).json({ message: "Item not found" });
    // console.log(item)
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
  try {
    const resturant = await Busninss.findOne({ slug: resturantSlug });
    if (!resturant)
      return res.status(404).json({ message: "Restaurant not found" });

    const items = await Item.aggregate([
      { $match: { bussnins_id: resturant._id } },
      { $sort: { views: -1 } },
      {
        $lookup: {
          from: "categories",
          localField: "gategoryID",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $group: { _id: "$category._id", items: { $push: "$$ROOT" } } },
      { $project: { items: { $slice: ["$items", 5] } } },
      { $unwind: "$items" },
      { $replaceRoot: { newRoot: "$items" } },
      { $addFields: { gategoryID: "$category" } },
    ]);

    const Promos = await Promo.find({
      bussninsId: resturant._id,
      isActive: true,
    });

    const categoryIds = items.map((item) => item.gategoryID._id);
    const categories = await Category.find({
      _id: { $in: categoryIds },
      isActive: true,
    }).sort({ order: 1 });

    const bussnise = await Busninss.find({ slug: resturantSlug }).populate({
      path: "type",
      select: "name",
    });

    res.json({
      menu: items,
      categris: categories,
      RestaurantNames: resturant.name,
      bussnise: bussnise,
      Promos: Promos,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/items/category", async (req, res) => {
  try {
    const {
      categoryId,
      restaurantSlug,
      page = 1,
      limit = 10,
      q = "",
    } = req.query;

    const Bussnisee = await Busninss.findOne({ slug: restaurantSlug });

    const skip = (page - 1) * limit;

    const query = {
      gategoryID: categoryId,
      bussnins_id: Bussnisee._id,
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { discription: { $regex: q, $options: "i" } },
      ],
    };

    const products = await Item.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate("gategoryID")
      .populate("bussnins_id");

    const total = await Item.countDocuments(query);

    res.json({
      products,
      total,
      hasMore: skip + products.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/items/search", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 5, bussnins_id } = req.query;

    const skip = (page - 1) * limit;

    const query = {
      bussnins_id,
      isActive: true,
      avalible: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { discription: { $regex: q, $options: "i" } },
      ],
    };

    const items = await Item.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    res.json({
      items,
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/info/allInfo", async (req, res) => {
  console.log("ok");
  try {
    const { restaurantSlug } = req.query;
    const store = await Busninss.findOne({ slug: restaurantSlug }).populate({
      path: "type",
      select: "name",
    });
    res.json(store);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/all/categorys", async (req, res) => {
  try {
    const { restaurantSlug } = req.query;
    const store = await Busninss.findOne({ slug: restaurantSlug });
    const categories = await Category.find({
      bussninsId: store._id,
      isActive: true,
    }).sort({ order: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});
export default router;

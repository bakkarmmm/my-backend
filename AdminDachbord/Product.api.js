import express from "express";
import Item from "../modelus/item.js";
import Busninss from "../modelus/Busninss.js";
import { protect } from "../midlware/auth.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const inserProudcts = async (req, res) => {
  try {
    const onwerID = req.user.id;
    const { name, price, categoriesId, disc, image, public_id } = req.body;

    const lines = disc
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const maindisc = lines?.[0] || "";
    const subDisc = lines?.slice(1).map((text, index) => ({
      id: index + 1,
      text,
    }));

    const bussnins = await Busninss.findOne({ bussnisOwner: onwerID });

    if (!bussnins) {
      return res
        .status(404)
        .json({ message: "Business not found for this user" });
    }

    const product = new Item({
      name,
      price,
      gategoryID: categoriesId,
      bussnins_id: bussnins._id,
      src: image, // ✅ رابط Cloudinary
      discription: maindisc,
      subDisc,
      ResturantSlug: bussnins.slug,
      public_id: public_id,
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.log("INSERT PRODUCT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getProducts = async (req, res) => {
  const onwerID = req.user.id;
  try {
    const bussnines = await Busninss.findOne({ bussnisOwner: onwerID });
    const item = await Item.find({ bussnins_id: bussnines._id });
    res.status(200).json({ items: item });
  } catch (error) {}
};
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ messaage: "item not found" });
    }

    // ⭐ حذف الصورة من Cloudinary
    if (item.public_id) {
      await cloudinary.uploader.destroy(item.public_id);
    }

    await Item.findByIdAndDelete(id);

    res.json("succufully delete this products");
  } catch (error) {
    res.json({ erorr: error });
  }
};
export const update = async (req, res) => {
  const id = req.params.id;

  try {
    if (!id) {
      return res.status(404).json("ID Product not found");
    }

    const { name, price, categoriesId, disc, image, public_id } = req.body;

    // ✅ جيب المنتج القديم
    const product = await Item.findById(id);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    const lines = disc
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const maindisc = lines?.[0] || "";
    const subDisc = lines?.slice(1).map((text, index) => ({
      id: index + 1,
      text,
    }));

    const updateData = {
      name,
      price,
      gategoryID: categoriesId,
      discription: maindisc,
      subDisc,
    };

    // ✅ اذا في صورة جديدة
    if (image && public_id) {
      // ⭐ حذف الصورة القديمة
      if (product.public_id) {
        await cloudinary.uploader.destroy(product.public_id);
      }

      updateData.src = image;
      updateData.public_id = public_id;
    }

    const updated = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    return res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
export const updateStatus = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      res.status(404).json("ID Product not found");
    }
    const { status } = req.body;
    console.log(status, id);
    if (status !== undefined) {
      const update = await Item.findByIdAndUpdate(
        id,
        { $set: { isActive: status } },
        { new: true },
      );
      return res.json("accepdate update", status);
    }
  } catch (error) {
    res.status(400).json({ err: error });
  }
};
export const updateAvaliblte = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      res.status(404).json("ID Product not found");
    }
    const { status } = req.body;
    console.log(status, id);
    if (status !== undefined) {
      const update = await Item.findByIdAndUpdate(
        id,
        { $set: { avalible: status } },
        { new: true },
      );
      return res.json("accepdate update", status);
    }
  } catch (error) {
    res.status(400).json({ err: error });
  }
};
router.put("/update-status/:id", protect, updateStatus);
router.put("/update-available/:id", protect, updateAvaliblte);
router.put("/update/:id", protect, upload.none(), update);
router.delete("/delete/:id", protect, deleteProduct);
router.post("/newProducts", protect, upload.none(), inserProudcts);
router.get("/getProducts", protect, getProducts);

export default router;

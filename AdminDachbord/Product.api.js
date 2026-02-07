import express from "express";
import Item from "../modelus/item.js";
import Busninss from "../modelus/Busninss.js";
import { protect } from "../midlware/auth.js";
import multer from "multer";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
export const inserProudcts = async (req, res) => {
  try {
    const onwerID = req.user.id;
    const { name, price, categoriesId, disc } = req.body;
    const lines = disc
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const maindisc = lines?.[0] || "";
    const subDisc = lines?.slice(1).map((text, index) => ({
      id: index + 1,
      text,
    }));
    console.log("step1");
    const image = req.file ? req.file.path : null;
    const bussnins = await Busninss.findOne({ bussnisOwner: onwerID });
    const product = new Item({
      name: name,
      price: price,
      gategoryID: categoriesId,
      bussnins_id: bussnins._id,
      src: image,
      discription: maindisc,
      subDisc: subDisc,
      ResturantSlug:bussnins.slug
    });
    console.log("step1");
    await product.save();
    console.log("step3");
    if (!bussnins) {
      return res
        .status(404)
        .json({ message: "Business not found for this user" });
    }
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json(error);
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
    console.log(id);
    const item = await Item.findByIdAndDelete({ _id: id });
    if (!item) {
      return res.status(404).json({ messaage: "item not found" });
    }
    res.json("succufully delete this products");
  } catch (error) {
    res.json({ erorr: error });
  }
};
export const update = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      res.status(404).json("ID Product not found");
    }
    const { name, price, categoriesId, disc } = req.body;
    const lines = disc
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const maindisc = lines?.[0] || "";
    const subDisc = lines?.slice(1).map((text, index) => ({
      id: index + 1,
      text,
    }));
    console.log("step1");
    const updateData = {
      name,
      price,
      gategoryID: categoriesId,
      discription: maindisc,
      subDisc,
    };
  
    if (req.file) {
      updateData.src = req.file.path;
    }

    const update = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    return res.json(update); 
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
export const updateStatus = async(req,res)=>{
  const id = req.params.id;
  try {
    if (!id) {
      res.status(404).json("ID Product not found");
    }
    const { status } = req.body;
    console.log(status,id)
    if(status !== undefined){
      const update = await Item.findByIdAndUpdate(
        id,
        { $set: {isActive:status}},
        { new: true }
      );
      return res.json("accepdate update",status)
    }
  } catch (error) {
    res.status(400).json({err:error})
  }
}
router.put("/update-status/:id", protect, updateStatus);
router.put("/update/:id", protect,upload.single("image"), update);
router.delete("/delete/:id", protect, deleteProduct);
router.post("/newProducts", protect, upload.single("image"), inserProudcts);
router.get("/getProducts", protect, getProducts);

export default router;

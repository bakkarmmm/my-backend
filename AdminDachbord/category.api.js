import express from "express";
import Item from "../modelus/item.js";
import Category from "../modelus/Category.js";
import Busninss from "../modelus/Busninss.js";
import { protect } from "../midlware/auth.js";
const router = express.Router();
export const getCtegories = async (req, res) => {
    try {
        const bId =  req.user.id;
        const bussnise = await Busninss.findOne({bussnisOwner:bId} );
        console.log(req.user.id)
      // const categoriesID = await Item.find({
      //   bussnins_id: bussnise._id, // ✅ من JWT
      // }).distinct("gategoryID");
      if (!bussnise) {
        return res.status(404).json({ message: "Business not found" });
      }
      const categories = await Category.find({bussninsId: bussnise._id});
      res.json(
        {categories: categories}
      )
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
export const insertCategorie = async (req,res)=>{
  const {name} = req.body;
  const owner_id = req.user.id

  try {
    const bussnise = await Busninss.findOne({bussnisOwner:owner_id} );
    if (!bussnise) {
      return res.status(404).json({ message: "Business not found" });
    }

    const newCategorie = Category.create({name,bussninsId:bussnise._id})
    res.status(200).json("insert succuffully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}
export const UpdateCategorie =  async(req,res)=>{
  const id = req.params.id
  try {
    const {name} = req.body
    console.log(id)
    if(!id){res.status(404).json("this categorie not found")}
    const update = await Category.findByIdAndUpdate(
      id,
      { $set: {name}},
      { new: true }
    );
    res.status(200).json("succifulley  update!")
  } catch (error) {
    res.status(400).json({error:error})
  }
}
export const updateStatus = async(req,res)=>{
  const id = req.params.id
  try {
    const {status} = req.body
    const update = await Category.findByIdAndUpdate(
      id,
      { $set: {isActive:status}},
      { new: true }
    );
    res.status(200).json("updated categorie")
  } catch (error) {
    res.status(400).json({error:error})
  }
}
export const deleteCategorie = async(req,res)=>{
  const id = req.params.id
  try {
    const categorie = await Category.findByIdAndDelete({ _id: id });
    res.status(200).json("delete categorie")
  } catch (error) {
    res.status(400).json({error:error})
  }
}
router.get('/getCategories',protect,getCtegories);
router.post('/insertCategorie',protect,insertCategorie);
router.put('/update/:id',protect,UpdateCategorie);
router.put('/update-status/:id',protect,updateStatus);
router.delete('/delete/:id',protect,deleteCategorie);
export default router;
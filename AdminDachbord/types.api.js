import express from "express";
import Type from "../modelus/BusninssTpye.js";

const router = express.Router();
export const getType = async (req, res) => {
  try {
    const types = await Type.find({});
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addType = async (req, res) => {
  try {
    const { TypeName, Layout, Description } = req.body;
 
    const type = new Type({
      name: TypeName,
      layout: Layout,
      disc: Description,
    });
    await type.save();
    res.json("Type added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteType = async (req,res)=>{
  try {
    const id = req.params.id;
    await Type.findByIdAndDelete(id);
    res.json("Type deleted successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const updateType = async (req,res)=>{
  try {
    const id = req.params.id;
    const { TypeName ,Layout, Description} = req.body;
    await Type.findByIdAndUpdate(id,
      { $set: { name: TypeName, layout: Layout, disc: Description } },
      { new: true }
    );
    res.json("Type updated successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
router.get("/getTypes", getType);
router.post("/addType", addType);
router.put("/updateType/:id", updateType);
router.delete("/deleteType/:id",deleteType);
export default router;

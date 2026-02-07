import express from "express";
import Category from "./modelus/Category.js";
const router = express.Router();
const gategory = [
  { id: 1, name: "drinks" },
  { id: 2, name: "meeer" },
  { id: 3, name: "fooods" },
  { id: 4, name: "chips" },
  { id: 5, name: "goomangods" },
  { id: 6, name: "gowwwods" },
];

router.get('/',(req,res)=>{
    res.json(gategory);
})

export default router;
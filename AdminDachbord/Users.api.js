import express from "express";
import { protect } from "../midlware/auth.js";
import Users from "../modelus/Users.js";
const router = express.Router();


const getUserById =  async (req,res)=>{
    try {
        const findUser = await Users.findById(req.user.id).select("name phone");
        res.json(findUser);
    } catch (error) {
        res.status(500).json(error)
    }
}
const updateUserInforamtion =  async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
}
router.get("/pofile",protect,getUserById);
router.get("/UpdateUser",protect,updateUserInforamtion);
export default router;
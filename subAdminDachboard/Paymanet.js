import express from "express";
import Plan from "../modelus/Plans.js";
import { protect } from "../midlware/auth.js";
import Paymant from "../modelus/Paymant.js";

const router = express.Router();

export const getPaymanets = async (req,res)=>{
    try {
        const all = await Paymant.find().select("status createdAt receiptImage").populate({
            path:"bussninsId",
            select:"name"
        }).populate(
            {
                path:"subsId",
                select:"paidAmount",
                populate:{path:"planId",select:"name"}
            }
        )
        res.json(all);
        console.log(all)
    } catch (error) {
        res.status(500).json(error)
    }
}
export const accepted = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
}
router.get("/allPaymants",getPaymanets);
export default router;
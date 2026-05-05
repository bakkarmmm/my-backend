import express from "express";
import dotenv from "dotenv";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import Bussnise from "../modelus/Busninss.js";
import Type from "../modelus/BusninssTpye.js";
import { protect } from "../midlware/auth.js";
import multer from "multer";
import slugify from "slugify";
import Subscription from "../modelus/Subscription.js";
import Paymant from "../modelus/Paymant.js";
import Plans from "../modelus/Plans.js";
import Category from "../modelus/Category.js";
import Item from "../modelus/item.js";
import Promo from "../modelus/Promo.js";
import sendNotification from "../sendNotification.js";

dotenv.config();
const router = express.Router();
// const analyticsDataClient = new BetaAnalyticsDataClient({
//   keyFilename: process.env.SERVICE_ACCOUNT_FILE,
// });
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.SERVICE_ACCOUNT_JSON),
});
const propertyId = process.env.GA_PROPERTY_ID;

const getStoreViewsDaily = async (storeName) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [
        { name: "date" }, // كل يوم
        { name: "pagePath" }, // صفحة المتجر
      ],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "EXACT",
            value: `/${storeName}`,
          },
        },
      },
    });

    // تحويل النتائج لمصفوفة يومية
    const dailyViews =
      response.rows?.map((row) => ({
        date: row.dimensionValues[0].value, // التاريخ YYYYMMDD
        pagePath: row.dimensionValues[1].value, // الرابط
        views: parseInt(row.metricValues[0].value),
      })) || [];

    return dailyViews;
  } catch (error) {
    console.error("Error fetching daily store views:", error);
    throw error;
  }
};
async function getTopProducts(storeSlug) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "BEGINS_WITH",
          value: `/${storeSlug}/`,
        },
      },
    },
    orderBys: [
      {
        metric: { metricName: "screenPageViews" },
        desc: true,
      },
    ],
    limit: 5,
  });

  // بدل الـ productId، نجيب الـ Item من MongoDB ونرجع اسمه
  const topProducts = [];
  for (const row of response.rows || []) {
    const path = row.dimensionValues[0].value;
    const views = Number(row.metricValues[0].value);
    const parts = path.split("/");
    const productIndex = parts.indexOf("product");

    let productId = null;

    if (productIndex !== -1 && parts[productIndex + 1]) {
      productId = parts[productIndex + 1];
    }

    const product = await Item.findById(productId).select("name");
    if (product) {
      topProducts.push({
        name: product.name,
        views,
      });
    }
  }

  return topProducts;
}
async function getWhatsAppClicks(storeSlug) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,

      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],

      dimensions: [{ name: "customEvent:store_name" }],

      metrics: [{ name: "eventCount" }],

      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "eventName",
                stringFilter: {
                  matchType: "EXACT",
                  value: "whatsapp_click",
                },
              },
            },
            {
              filter: {
                fieldName: "customEvent:store_name",
                stringFilter: {
                  matchType: "EXACT",
                  value: storeSlug,
                },
              },
            },
          ],
        },
      },
    });

    const total =
      response.rows?.reduce((sum, row) => {
        return sum + Number(row.metricValues[0].value);
      }, 0) || 0;

    return total;
  } catch (error) {
    console.error("GA4 error:", error);
    throw error;
  }
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
export const getMyBussnises = async (req, res) => {
  try {
    const bussnises = await Bussnise.find({
      bussnisOwner: req.user.id, // ✅ من JWT
    }).populate({ path: "type", strictPopulate: false });
    res.json(bussnises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getMyBussnisesforapp = async (req, res) => {
  try {
    const bussnises = await Bussnise.findOne({
      bussnisOwner: req.user.id, // ✅ من JWT
    }).populate({ path: "type", strictPopulate: false });
    res.json(bussnises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateMyBussnise = async (req, res) => {
  try {
    const {
      name,
      type,
      disc,
      contact,
      address,
      color,
      openTime,
      closedTime,
      logoImage,
      coverImage,
      location,
      exchangerate,
      instaLink,
      fecbookLink,
    } = req.body;
    console.log(req.body);
    const locationData = location
      ? {
          type: "Point",
          coordinates: [location.coordinates[0], location.coordinates[1]], // GeoJSON expects [lng, lat]
        }
      : undefined;
    const updated = await Bussnise.findOneAndUpdate(
      { bussnisOwner: req.user.id },
      {
        name,
        type,
        disc,
        contact,
        adrres:address,
        theme: color,
        openTime: openTime,
        closeTime: closedTime,
        coverImage,
        logoImage,
        slug: slugify(name, { lower: true }),
        ...(locationData && { location: locationData }),
        exchangerate,
        instaLink,
        fecbookLink,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({
      message: "Business updated successfully",
      data: updated,
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.slug) {
      return res.status(400).json({ message: "business_exists" });
    }
    res.status(500).json({ message: err.message });
  }
};
export const registerBussnise = async (req, res) => {
  console.log(req.body);
  try {
    const { name, type, contact, plan, image } = req.body;

    // const image = req.file ? req.file.filename : null;
    // const findPlan = await Plans.findById(plan);
    // if (!req.file) {
    //   return res.status(400).json({
    //     message: "Receipt image is required",
    //   });
    // }

    console.log(image);
    console.log(req.body);
    const newBussnise = new Bussnise({
      name: name,
      bussnisOwner: req.user.id,
      slug: slugify(name, { lower: true }),
      type: type,
      contact: contact,
    });

    await newBussnise.save();
    const selectedPlan = await Plans.findById(plan); // plan هنا هو _id

    if (!selectedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    console.log(newBussnise);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const newSubscription = new Subscription({
      busId: newBussnise._id,
      planId: selectedPlan._id,
      startDate,
      endDate,
      paidAmount: selectedPlan.price,
      status: "pending",
    });
    console.log("Before saving subscription:", newSubscription);
    try {
      await newSubscription.save();
      console.log("Subscription saved successfully:", newSubscription);
    } catch (subError) {
      console.error("Error saving subscription:", subError);
      return res.status(500).json({
        message: "Failed to save subscription",
        error: subError.message,
      });
    }
    const exist = await Paymant.findOne({
      subsId: newSubscription._id,
      status: "PENDING",
    });

    if (exist) {
      return res.status(400).json({
        message: "There is already a pending payment for this subscription",
      });
    }
    console.log(newSubscription);
    const newPaymant = new Paymant({
      bussninsId: newBussnise._id,
      subsId: newSubscription._id,
      receiptImage: image,
      status: "PENDING",
      amount: selectedPlan.price,
    });
    console.log("Before saving payment:", newPaymant);
    try {
      await newPaymant.save();
      console.log("Payment saved successfully:", newPaymant);
    } catch (saveError) {
      console.error("Error saving payment:", saveError);
      return res
        .status(500)
        .json({ message: "Failed to save payment", error: saveError.message });
    }
    console.log(newPaymant);
    res.json(
      "your business registered successfully please contact admin to activate it",
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
export const registerBussniseFree = async (req, res) => {
  console.log(req.body);
  try {
    const { name, type, contact } = req.body;
    console.log(req.body);
    const bussniseRegister = await Bussnise.findOne({ name: name });
    if (bussniseRegister) {
      return res
        .status(400)
        .json({ message: "bussnise is Registred Please Enter new Name" });
    }
    const newBussnise = new Bussnise({
      name: name,
      bussnisOwner: req.user.id,
      slug: slugify(name, { lower: true }),
      type: type,
      contact: contact,
    });
    await newBussnise.save();
    const selectedPlan = await Plans.findOne({ isDefault: true });
    if (!selectedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    console.log(newBussnise);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const newSubscription = new Subscription({
      busId: newBussnise._id,
      planId: selectedPlan._id,
      startDate,
      endDate,
      paidAmount: selectedPlan.price,
      status: "pending",
    });
    console.log("Before saving subscription:", newSubscription);
    try {
      await newSubscription.save();
      console.log("Subscription saved successfully:", newSubscription);
    } catch (subError) {
      console.error("Error saving subscription:", subError);
      return res.status(500).json({
        message: "Failed to save subscription",
        error: subError.message,
      });
    }
    const exist = await Paymant.findOne({
      subsId: newSubscription._id,
      status: "PENDING",
    });

    if (exist) {
      return res.status(400).json({
        message: "There is already a pending payment for this subscription",
      });
    }
    console.log(newSubscription);
    const newPaymant = new Paymant({
      bussninsId: newBussnise._id,
      subsId: newSubscription._id,
      receiptImage: "",
      status: "PENDING",
      amount: 0,
    });
    console.log("Before saving payment:", newPaymant);
    try {
      await newPaymant.save();
      console.log("Payment saved successfully:", newPaymant);
    } catch (saveError) {
      console.error("Error saving payment:", saveError);
      return res
        .status(500)
        .json({ message: "Failed to save payment", error: saveError.message });
    }
    console.log(newPaymant);
    res.json(
      "your business registered successfully please contact admin to activate it",
    );
    await sendNotification(`
    🆕 *New Store Registered*

🏬 ${newBussnise.name}
📧 ${newBussnise.contact || "Email not specified"}
⚡ Status: ${newBussnise.status}
`);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "business_exists",
      });
    }
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
export const checkMyBussnise = async (req, res) => {
  try {
    const bussnise = await Bussnise.findOne({
      bussnisOwner: req.user.id,
    });
    if (!bussnise) {
      return res.json({
        hasBusiness: false,
        status: null,
      });
    }
    const subscription = await Subscription.findOne({
      busId: bussnise._id,
    }).sort({ endDate: -1 }); // آخر اشتراك

    const subscriptionStatus = subscription ? subscription.status : null;
    res.json({
      hasBusiness: true,
      status: bussnise.status, // ACTIVE | PENDING | REJECTED
      subscriptionStatus, // ["active","expired","canceled","pending"],
      businessId: bussnise._id,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
export const GenraleInfo = async (req, res) => {
  const id = req.params.id;
  console.log("hello");
  try {
    const bussnise = await Bussnise.findOne({
      bussnisOwner: req.user.id,
    });
    const Gategoires = await Category.countDocuments({
      bussninsId: bussnise._id,
    });
    const Products = await Item.countDocuments({ bussnins_id: bussnise._id });
    const Promos = await Promo.countDocuments({ bussninsId: bussnise._id });
    res.json({
      products: Products,
      categories: Gategoires,
      promos: Promos,
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
export const StoreViews = async (req, res) => {
  const { storeName } = req.params;
  console.log(req.user.id);
  try {
    const bussnises = await Bussnise.findOne({
      bussnisOwner: req.user.id,
    });
    console.log(bussnises.slug);
    const views = await getStoreViewsDaily(bussnises.slug);
    const Top5 = await Item.find({ bussnins_id: bussnises._id })
      .sort({ views: -1 })
      .limit(5)
      .select("name views");
    const whatssapEvents = await getWhatsAppClicks(bussnises.slug);
    res.json({ views, Top5, whatssapEvents });
  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error); // 👈 مهم جداً
    res.status(500).json({ error: error.message });
  }
};
router.get("/dachboard/my", protect, getMyBussnises);
router.get("/me", protect, getMyBussnisesforapp);
router.get("/GeneraleInfo", protect, GenraleInfo);
router.put("/update", protect, updateMyBussnise);
router.get("/check", protect, checkMyBussnise);
// router.post("/addBussnise", protect, upload.single("image"), registerBussnise);
router.post("/addBussnise", protect, upload.none(), registerBussnise);
router.post("/addBussniseFree", protect, upload.none(), registerBussniseFree);
router.get("/store-views", protect, StoreViews);
export default router;

import express from "express";
import cors from "cors"; 
const app = express();
app.use(cors());
app.use(express.json());

import productApi from "./Product.api.js";
// app.use("/",productApi);
// import gategoryApi from "./Gategory.api.js"
// app.use('/',gategoryApi)
import LoginApi from './auth.js';

import Dachbordapi from './AdminDachbord/busniniss.api.js';
import TypesApi from './AdminDachbord/types.api.js';
import CategoryApi from './AdminDachbord/category.api.js';
import UsersApi from './AdminDachbord/Users.api.js';
import bussninsProductApi from './AdminDachbord/Product.api.js';
import mangeBussnine from './subAdminDachboard/bussninsMangment.js';
import ownerApi from './subAdminDachboard/owner.js';
import plansApi from './subAdminDachboard/plans.js';
import subscApi from './subAdminDachboard/subscription.js'
import paymantsApi from './subAdminDachboard/Paymanet.js'
app.use("/auth",LoginApi)
app.use("/dachboard",Dachbordapi)
app.use("/products",productApi)
app.use("/types",TypesApi)
app.use("/categories",CategoryApi)
app.use("/productsbussnins",bussninsProductApi)
app.use("/mangmentBussnies",mangeBussnine)
app.use("/owner",ownerApi);
app.use("/plans",plansApi);
app.use("/subscription",subscApi);
app.use("/paymantes",paymantsApi);
app.use("/users",UsersApi)
app.use('/uploads', express.static('uploads'));

export default app;
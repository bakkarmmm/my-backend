// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./modelus/Users.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  
  const { Username, password } = req.body;
  // const user = await User.findOne({ name: Username ,isActive:true}).select("+password");
  const user = await User.findOne({ name: Username }).select("+password");
   if (!user) {
      return res.status(401).json({ message: "User not found" }); 
    }
  if (!user.isActive ) {
    return res.status(403).json({
      message: "Your account is deactivated. Please contact admin."
    });
  }
  if (!user)
    return res.status(401).json({ message: "Invalid name or password" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid name or password" });
  
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "default-secret-key-change-in-production",
    { expiresIn: "7d" }
  );

  res.json({
    token,
    role: user.role,
    name: user.name,
    active:user.isActive,
  });
});
router.post("/register", async (req, res) => {
  try {
    const { Username, password, phone } = req.body;

   
    if (!Username || !password) {
      return res.status(400).json({
        message: "Name and password are required",
      });
    }

    
    const existingUser = await User.findOne({ name:Username });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: Username,
      password: hashedPassword,
      phone,
      role: "bussnisOwner", 
      isActive: false,
    });

    
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "default-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;

import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoError } from "mongodb";
import { log } from "../infrastructure/logger.js";
import { AuthError } from "./auth.error.js";
import { User } from "./user.model.js";
import { registerValidator, validateLogin } from "./validators.js";

export const router = express.Router();

router.post("/register", registerValidator, async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      // 员工后台添加，不走注册接口
      role: "guest",
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      // TODO 添加刷新 token
      { expiresIn: "8h" },
    );

    res.status(201).json({
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (err) {
    if (err instanceof MongoError && err.code === 11000) {
      throw new AuthError("该邮箱或手机号已注册", 400);
    }

    throw err;
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      // TODO 添加刷新 token
      { expiresIn: "8h" },
    );

    res.json({
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (err) {
    log.error(`login failed: ${err.message}`);
    res.status(500).json({ error: "Login failed" });
  }
});

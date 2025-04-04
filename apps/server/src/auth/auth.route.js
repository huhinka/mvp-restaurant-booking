import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { MongoError } from "mongodb";
import { AuthError } from "./auth.error.js";
import { User } from "./user.model.js";
import { loginValidator, registerValidator } from "./validators.js";

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
    // TODO 这个异常检测应该在上面 User.create 上处理，而不是全局
    if (err instanceof MongoError && err.code === 11000) {
      throw new AuthError("该邮箱或手机号已注册", 400);
    }

    throw err;
  }
});

router.post("/login", loginValidator, async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthError("账号密码有误");
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
});

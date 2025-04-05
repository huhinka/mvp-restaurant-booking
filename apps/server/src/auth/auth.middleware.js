import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { AuthError, ForbiddenError } from "./auth.error.js";

export const auth = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      new AuthError("Authorization header missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const detail = err.message.includes("jwt expired")
        ? "Token 已过期"
        : "无效的 Token";
      throw new AuthError(detail);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      new AuthError("用户不存在");
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new ForbiddenError();
    }

    req.user = user;
    next();
  };
};

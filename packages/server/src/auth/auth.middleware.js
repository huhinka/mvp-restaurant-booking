import jwt from "jsonwebtoken";
import { log } from "../infrastructure/logger.js";
import { User } from "./user.model.js";

export const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Authorization header missing or invalid" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.user = user;
      next();
    } catch (err) {
      log.error(`Authentication error: ${err.message}`);

      const errorResponse = {
        error: "Authentication failed",
        details: err.message.includes("jwt expired")
          ? "Token expired"
          : "Invalid token",
      };

      res.status(401).json(errorResponse);
    }
  };
};

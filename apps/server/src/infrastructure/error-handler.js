/* eslint-disable no-unused-vars */
import { AppError } from "./error.js";
import { log } from "./logger.js";

export default function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    });
  }

  log.error(`未处理的错误：${req.method}, ${req.path}, ${err.stack}`);

  res.status(500).json({
    message: "Internal Server Error",
  });
}

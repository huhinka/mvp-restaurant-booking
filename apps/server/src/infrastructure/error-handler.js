/* eslint-disable no-unused-vars */
import { AppError } from "./error.js";
import { log } from "./logger.js";

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      message: err.message,
      errors: err.errors,
    });
  }

  log.error(
    `未处理的错误：${statusCode} - ${req.method}, ${req.path}, ${err.stack}`,
  );

  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

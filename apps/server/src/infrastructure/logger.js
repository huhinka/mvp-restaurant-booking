/**
 * 日志模块。
 *
 * 使用：
 *   import { logger } from './logger.js'
 *   log.debug('info message')
 *   log.info('info message')
 *   log.error('info message')
 *
 * 非生产环境下日志会输出到标准输出和日志文件，生产环境下只输出到日志文件。
 * 日志文件按照日期滚动存储，单个文件最大 20m。
 */
import winston from "winston";
import "winston-daily-rotate-file";

function transportOption(filename, error = false) {
  return {
    filename: filename,
    level: error ? "error" : "info",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
  };
}

export const log = winston.createLogger({
  level: process.env.LOGGER_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: "mvp-restaurant-booking" },
  transports: [
    new winston.transports.DailyRotateFile(
      transportOption(process.env.LOGGER_ERROR_FILE || "logs/error.log", true),
    ),
    new winston.transports.DailyRotateFile(
      transportOption(process.env.LOGGER_COMBINED_FILE || "logs/combined.log"),
    ),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.align(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
  ],
});

export const loggerStream = {
  write: (message) => {
    log.info(message);
  },
};

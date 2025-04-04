import mongoose from "mongoose";
import { log } from "./logger.js";
import { migrateDb } from "./db-migrate.js";
/**
 * 连接并初始化数据库。
 */
export async function connectWithRetry() {
  try {
    await connectDb();
  } catch (err) {
    log.error("can not init connection, try later:", err);
    setTimeout(() => connectWithRetry(), 5000);
  }
}

/**
 * 连接数据库。
 */
export async function connectDb(mongodbUrl) {
  const mongodb = mongodbUrl ?? process.env.MONGODB_URI;

  log.info(`connect ${mongodb}...`);

  await mongoose.connect(mongodb, {
    autoIndex: false,
    readPreference: "primary",
  });

  await migrateDb();

  log.info(`${mongodb} connected`);

  mongoose.connection.on("disconnected", () => {
    log.info(`${mongodb} disconnected`);
  });

  mongoose.connection.on("reconnected", () => {
    log.info(`${mongodb} reconnected`);
  });
}

export async function closeDb() {
  await mongoose.connection.close();
}

import "dotenv/config.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { before, after } from "mocha";
import mongoose from "mongoose";
import { log } from "../src/infrastructure/logger.js";

let mongoServer;

before(async () => {
  log.info(`Starting in-memory MongoDB server`);
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  log.info(`Connecting to in-memory MongoDB instance at ${uri}`);
  await mongoose.connect(uri, {});
  log.info(`MongoDB connected`);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

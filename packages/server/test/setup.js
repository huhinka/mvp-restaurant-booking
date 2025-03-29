import "dotenv/config.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { before, after } from "mocha";
import mongoose from "mongoose";

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {});
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

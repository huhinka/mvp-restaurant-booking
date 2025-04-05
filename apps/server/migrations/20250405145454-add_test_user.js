/* eslint-disable no-unused-vars */
import { encryptPassword } from "../src/auth/auth.util.js";

const guest = {
  email: "guest@example.com",
  phone: "13612341234",
  password: "12345678",
  role: "guest",
};

const staff = {
  email: "staff@example.com",
  phone: "13912341234",
  password: "12345678",
  role: "staff",
};

async function testUser(user) {
  return {
    ...user,
    password: await encryptPassword(user.password),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  await db
    .collection("users")
    .insertMany([await testUser(guest), await testUser(staff)]);
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  await db
    .collection("users")
    .deleteMany({ email: { $in: [guest.email, staff.email] } });
};

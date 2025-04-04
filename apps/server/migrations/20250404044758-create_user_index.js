/* eslint-disable no-unused-vars */
const emailIndexName = "email_index";
const phoneIndexName = "phone_index";

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  await db
    .collection("users")
    .createIndex({ email: 1 }, { unique: true, name: emailIndexName });
  await db
    .collection("users")
    .createIndex({ phone: 1 }, { unique: true, name: phoneIndexName });
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  await db.collection("users").dropIndex(emailIndexName);
  await db.collection("users").dropIndex(phoneIndexName);
};

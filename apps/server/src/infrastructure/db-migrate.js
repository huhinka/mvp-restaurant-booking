import { database, up } from "migrate-mongo";
import { log } from "./logger.js";

export async function migrateDb() {
  let client;
  try {
    const conn = await database.connect();
    client = conn.client;

    const migrated = await up(conn.db, client);
    migrated.forEach((filename) => log.info(`Migrated: ${filename}`));
  } catch (err) {
    log.error(`Migration failed: ${err.stack}`);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

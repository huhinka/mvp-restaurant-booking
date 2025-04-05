import "dotenv/config.js";
import http from "http";
import { app } from "./app.js";
import { closeDb, connectWithRetry } from "./infrastructure/db.js";
import { log } from "./infrastructure/logger.js";

const server = http.createServer(app);

const port = process.env.PORT || 3030;

connectWithRetry();

server.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});

process.on("SIGINT", () => {
  closeDb().then(() => {
    log.info("Database connection closed");
    process.exit(0);
  });
});

process.on("exit", (code) => {
  log.info(`Process exited with code ${code}`);
});

process.on("uncaughtException", (err) => {
  log.error(`未捕获异常: ${err.stack}`);

  // 快速失败
  process.exit(1);
});


import "dotenv/config";

import app from "./app.js";

import {
  connectMongoDB,
  closeMongoDB
} from "./config/mongodb.js";

import {
  connectRedis,
  closeRedis
} from "./config/redis.js";

import { initializeUrlCollection } from "./models/url.model.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectMongoDB();
    await connectRedis();
    await initializeUrlCollection();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown() {
  await Promise.allSettled([
    closeMongoDB(),
    closeRedis()
  ]);

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();

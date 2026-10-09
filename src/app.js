
import express from "express";
import { getDatabase } from "./config/mongodb.js";
import { getRedisClient } from "./config/redis.js";

import { ipRateLimiter } from "./middleware/rateLimiter.js";
import urlRoutes from "./routes/url.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "URL Shortener API",
    status: "running"
  });
});

// Health check
app.get("/health", async (req, res) => {
  const health = {
    server: "ok",
    mongodb: "unknown",
    redis: "unknown"
  };

  try {
    await getDatabase().command({ ping: 1 });
    health.mongodb = "ok";
  } catch {
    health.mongodb = "error";
  }

  try {
    await getRedisClient().ping();
    health.redis = "ok";
  } catch {
    health.redis = "error";
  }

  const healthy =
    health.mongodb === "ok" &&
    health.redis === "ok";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "error",
    services: health
  });
});

// Create short URLs
app.use("/api/urls", ipRateLimiter, urlRoutes);

// Retrieve URL analytics
app.use("/api/urls", ipRateLimiter, analyticsRoutes);

// Redirect short URLs
app.use("/", ipRateLimiter, redirectRoutes);

export default app;

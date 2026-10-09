
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export async function connectRedis() {
  await redisClient.connect();

  await redisClient.ping();

  console.log("Redis connected successfully");
}

export function getRedisClient() {
  if (!redisClient.isReady) {
    throw new Error("Redis is not ready");
  }

  return redisClient;
}

export async function closeRedis() {
  if (redisClient.isOpen) {
    await redisClient.close();
    console.log("Redis connection closed");
  }
}

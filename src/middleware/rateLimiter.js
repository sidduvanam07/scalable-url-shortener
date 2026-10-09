
import { randomUUID } from "node:crypto";
import { getRedisClient } from "../config/redis.js";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;    // 100 requests per IP per minute

const slidingWindowScript = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowStart = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]
  local windowMs = tonumber(ARGV[5])

  redis.call("ZREMRANGEBYSCORE", key, "-inf", windowStart)

  local count = redis.call("ZCARD", key)

  if count >= limit then
    return {0, count, redis.call("PTTL", key)}
  end

  redis.call("ZADD", key, now, member)
  redis.call("PEXPIRE", key, windowMs)

  return {1, count + 1, redis.call("PTTL", key)}
`;

export async function ipRateLimiter(req, res, next) {
  try {
    const redis = getRedisClient();

    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `rate-limit:ip:${ip}`;

    const result = await redis.eval(slidingWindowScript, {
      keys: [key],
      arguments: [
        String(now),
        String(windowStart),
        String(MAX_REQUESTS),
        randomUUID(),
        String(WINDOW_MS)
      ]
    });

    const allowed = Number(result[0]) === 1;
    const currentCount = Number(result[1]);

    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS - currentCount)
    );

    if (!allowed) {
      const ttl = Math.max(1, Number(result[2]));
      res.setHeader("Retry-After", Math.ceil(ttl / 1000));

      return res.status(429).json({
        error: "Too many requests",
        message: "Request limit exceeded. Please try again later.",
        limit: MAX_REQUESTS,
        windowSeconds: WINDOW_MS / 1000
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error.message);
    next();
  }
}

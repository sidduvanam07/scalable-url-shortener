
import { generateShortCode } from "../utils/base62.js";
import { getUrlCollection } from "../models/url.model.js";
import { getRedisClient } from "../config/redis.js";

export async function createShortUrl(originalUrl) {
  const urls = getUrlCollection();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode();

    const document = {
      code,
      originalUrl,
      createdAt: new Date(),
      clickCount: 0,
      isActive: true
    };

    try {
      await urls.insertOne(document);

      return {
        code,
        shortUrl: `http://localhost:3000/${code}`,
        originalUrl
      };
    } catch (error) {
      if (error.code === 11000) continue;
      throw error;
    }
  }

  throw new Error("Unable to generate a unique short code");
}

export async function getOriginalUrl(code) {
  const urls = getUrlCollection();
  const cacheKey = `url:${code}`;

  // Try Redis, but continue if it is unavailable
  try {
    const redis = getRedisClient();
    const cachedUrl = await redis.get(cacheKey);

    if (cachedUrl) {
      console.log("Redis cache HIT:", code);
      return JSON.parse(cachedUrl);
    }

    console.log("Redis cache MISS:", code);
  } catch (error) {
    console.error("Redis read failed; using MongoDB:", error.message);
  }

  // MongoDB fallback
  const urlDocument = await urls.findOne({
    code,
    isActive: true
  });

  if (!urlDocument) return null;

  // Cache the result when Redis is available
  try {
    const redis = getRedisClient();

    await redis.set(
      cacheKey,
      JSON.stringify(urlDocument),
      { EX: 3600 }
    );
  } catch (error) {
    console.error("Redis cache write failed:", error.message);
  }

  return urlDocument;
}

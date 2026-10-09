
import { createShortUrl } from "../services/url.service.js";

export async function createUrl(req, res) {
  try {
    const { url } = req.body;

    if (typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        error: "A URL string is required"
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        error: "Invalid URL format"
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are allowed"
      });
    }

    const result = await createShortUrl(parsedUrl.href);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Create URL error:", error.message);

    return res.status(500).json({
      error: "Failed to create short URL"
    });
  }
}

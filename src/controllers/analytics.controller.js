
import { getUrlAnalytics } from "../services/analytics.service.js";

export async function getAnalytics(req, res) {
  try {
    const { code } = req.params;

    const analytics = await getUrlAnalytics(code);

    if (!analytics) {
      return res.status(404).json({
        error: "Short URL not found"
      });
    }

    return res.status(200).json({
      message: "Analytics retrieved successfully",
      analytics
    });
  } catch (error) {
    console.error("Analytics retrieval error:", error.message);

    return res.status(500).json({
      error: "Failed to retrieve URL analytics"
    });
  }
}

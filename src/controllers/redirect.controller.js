
import { getOriginalUrl } from "../services/url.service.js";
import { recordClick } from "../services/analytics.service.js";

export async function redirectUrl(req, res) {
  try {
    const { code } = req.params;
    const urlDocument = await getOriginalUrl(code);

    if (!urlDocument) {
      return res.status(404).json({
        error: "Short URL not found"
      });
    }

    try {
      await recordClick(code, {
        referrer: req.get("referer"),
        userAgent: req.get("user-agent")
      });
    } catch (analyticsError) {
      // Analytics failure should not prevent redirection
      console.error("Click analytics error:", analyticsError.message);
    }

    return res.redirect(302, urlDocument.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error.message);
    return res.status(500).json({
      error: "Failed to redirect"
    });
  }
}

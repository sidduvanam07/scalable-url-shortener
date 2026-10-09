
import { getDatabase } from "../config/mongodb.js";
import { getUrlCollection } from "../models/url.model.js";

// Record a click event before updating the counter
export async function recordClick(code, requestInfo = {}) {
  const db = getDatabase();
  const urls = getUrlCollection();
  const now = new Date();

  const url = await urls.findOne(
    { code, isActive: true },
    { projection: { _id: 1 } }
  );

  if (!url) {
    return false;
  }

  // Store the event first: events are the source of truth
  await db.collection("clickEvents").insertOne({
    code,
    clickedAt: now,
    referrer: requestInfo.referrer || null,
    userAgent: requestInfo.userAgent || null
  });

  // Update the counter separately
  try {
    await urls.updateOne(
      { _id: url._id },
      {
        $inc: { clickCount: 1 },
        $set: { lastClickedAt: now }
      }
    );
  } catch (error) {
    console.error(
      "Click event saved, but counter update failed:",
      error.message
    );
  }

  return true;
}

// Rebuild the stored counter from click events
export async function reconcileClickCount(code) {
  const db = getDatabase();
  const urls = getUrlCollection();

  const count = await db.collection("clickEvents").countDocuments({
    code
  });

  const latestEvent = await db.collection("clickEvents")
    .find({ code })
    .sort({ clickedAt: -1 })
    .limit(1)
    .next();

  const update = {
    $set: { clickCount: count }
  };

  if (latestEvent) {
    update.$set.lastClickedAt = latestEvent.clickedAt;
  } else {
    update.$unset = { lastClickedAt: "" };
  }

  const result = await urls.updateOne(
    { code },
    update
  );

  return {
    code,
    eventCount: count,
    updated: result.matchedCount === 1
  };
}

// Retrieve analytics using recorded events as the source of truth
export async function getUrlAnalytics(code) {
  const db = getDatabase();
  const urls = getUrlCollection();
  const events = db.collection("clickEvents");

  const url = await urls.findOne(
    { code, isActive: true },
    {
      projection: {
        _id: 0,
        code: 1,
        originalUrl: 1,
        createdAt: 1,
        lastClickedAt: 1
      }
    }
  );

  if (!url) {
    return null;
  }

  const [clickCount, recentClicks, referrerStats] = await Promise.all([
    events.countDocuments({ code }),

    events.find(
      { code },
      {
        projection: {
          _id: 0,
          clickedAt: 1,
          referrer: 1,
          userAgent: 1
        }
      }
    )
      .sort({ clickedAt: -1 })
      .limit(20)
      .toArray(),

    events.aggregate([
      { $match: { code } },
      {
        $group: {
          _id: "$referrer",
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } }
    ]).toArray()
  ]);

  return {
    ...url,
    clickCount,
    recentClicks,
    referrerStats: referrerStats.map(item => ({
      referrer: item._id || "Direct / Unknown",
      clicks: item.clicks
    }))
  };
}

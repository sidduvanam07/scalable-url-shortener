
import { getDatabase } from "../config/mongodb.js";

export async function initializeUrlCollection() {
  const db = getDatabase();

  await db.collection("urls").createIndex(
    { code: 1 },
    { unique: true }
  );

  await db.collection("clickEvents").createIndex({
    code: 1,
    clickedAt: -1
  });

  console.log("URL and analytics indexes initialized");
}

export function getUrlCollection() {
  return getDatabase().collection("urls");
}

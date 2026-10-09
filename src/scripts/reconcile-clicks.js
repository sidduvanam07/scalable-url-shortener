
import "dotenv/config";
import { connectMongoDB, closeMongoDB } from "../config/mongodb.js";
import { reconcileClickCount } from "../services/analytics.service.js";

async function main() {
  const code = process.argv[2];

  if (!code) {
    console.error(
      "Usage: node src/scripts/reconcile-clicks.js <shortCode>"
    );
    process.exitCode = 1;
    return;
  }

  await connectMongoDB();

  const result = await reconcileClickCount(code);

  if (!result.updated) {
    console.error(`URL not found: ${code}`);
    process.exitCode = 1;
    return;
  }

  console.log("Click count reconciled:", result);
}

main()
  .catch((error) => {
    console.error("Reconciliation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongoDB();
  });

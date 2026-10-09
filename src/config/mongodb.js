
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

let database;

export async function connectMongoDB() {
  await client.connect();

  database = client.db(process.env.MONGODB_DB_NAME);

  await database.command({ ping: 1 });

  console.log("MongoDB connected successfully");
}

export function getDatabase() {
  if (!database) {
    throw new Error("MongoDB is not connected");
  }

  return database;
}

export async function closeMongoDB() {
  await client.close();
  console.log("MongoDB connection closed");
}

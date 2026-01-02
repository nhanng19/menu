import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = 'pepperjackcheese';

if (!MONGODB_URI) {
  throw new Error('Invalid/missing environment variable: "MONGODB_URI"');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = 'pepperjackcheese';

if (!MONGODB_URI) {
  throw new Error('Invalid/missing environment variable: "MONGODB_URI"');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectingPromise: Promise<{ client: MongoClient; db: Db }> | null = null;

export async function connectToDatabase() {
  // Return cached connection if available and still connected
  if (cachedClient && cachedDb) {
    try {
      // Ping to check if connection is still alive
      await cachedDb.admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, reset cache
      cachedClient = null;
      cachedDb = null;
    }
  }

  // If already connecting, wait for that connection
  if (connectingPromise) {
    return connectingPromise;
  }

  // Create new connection with optimized settings
  connectingPromise = (async () => {
    try {
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10, // Limit connection pool size
        minPoolSize: 1,
        maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // Connection timeout
      });

      await client.connect();
      const db = client.db(DB_NAME);

      cachedClient = client;
      cachedDb = db;
      connectingPromise = null;

      return { client, db };
    } catch (error) {
      connectingPromise = null;
      throw error;
    }
  })();

  return connectingPromise;
}

export async function getDatabase() {
  const { db } = await connectToDatabase();
  return db;
}

// Gracefully close connection on process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (cachedClient) {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
    }
    process.exit(0);
  });
}

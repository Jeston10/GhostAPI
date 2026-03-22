import { type Db, MongoClient, ServerApiVersion } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

/** Matches MongoDB Atlas “Stable API” snippet (Node driver). */
const mongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
} as const;

function requireUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Set it in .env.local (see .env.example)."
    );
  }
  return uri;
}

/**
 * Cached MongoClient promise — avoids new connections on every request
 * (important for dev Fast Refresh and for serverless warm starts).
 * The client stays open for the app lifetime; do not call `close()` per request.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(
      requireUri(),
      mongoClientOptions
    ).connect();
  }
  return globalForMongo._mongoClientPromise;
}

/** Default DB: `MONGODB_DB` or the database name from your connection string. */
export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  const name = process.env.MONGODB_DB?.trim();
  return name ? client.db(name) : client.db();
}

export async function pingMongo(): Promise<void> {
  const client = await getMongoClientPromise();
  await client.db("admin").command({ ping: 1 });
}

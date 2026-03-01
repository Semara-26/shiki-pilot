import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

function getRedisClient(): RedisClientType {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }
  if (!client) {
    client = createClient({ url });
    client.on("error", (err) => console.error("Redis Client Error:", err));
  }
  return client;
}

/** Memastikan koneksi Redis siap sebelum digunakan (penting untuk serverless) */
export async function ensureRedisConnected(): Promise<RedisClientType> {
  const redis = getRedisClient();
  if (!redis.isReady) {
    await redis.connect();
  }
  return redis;
}

export { getRedisClient };

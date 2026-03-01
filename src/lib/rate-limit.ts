import { ensureRedisConnected } from "./redis";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 4;

export type RateLimitResult = {
  allowed: boolean;
  count: number;
};

/**
 * Memeriksa rate limit per user. Menggunakan Redis INCR + EXPIRE.
 * Batas: 4 request per menit per user.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const redis = await ensureRedisConnected();
    const key = `rate_limit:${userId}`;

    const count = await redis.incr(key);

    // Jika INCR mengembalikan 1, key baru dibuat → set EXPIRE 60 detik
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    return {
      allowed: count <= RATE_LIMIT_MAX_REQUESTS,
      count,
    };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Jika Redis gagal, izinkan request agar layanan tetap berjalan
    return { allowed: true, count: 0 };
  }
}

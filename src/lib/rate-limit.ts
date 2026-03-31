import { ratelimit } from "./redis";

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  limit: number;
  reset: number;
};

/**
 * Memeriksa rate limit per user menggunakan Upstash Ratelimit.
 * Batas: 10 request per menit (sliding window).
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(userId);

    return {
      allowed: success,
      count: limit - remaining,
      remaining,
      limit,
      reset,
    };
  } catch (err) {
    console.error("Rate limit check error:", err);
    // Jika Redis gagal, izinkan request agar layanan tetap berjalan
    return { 
      allowed: true, 
      count: 0,
      remaining: 25,
      limit: 25,
      reset: Date.now() + 60000
    };
  }
}

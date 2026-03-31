import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Inisialisasi Upstash Redis Client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Konfigurasi Rate Limiter.
 * Batas: 25 request per 60 detik (1 menit).
 * Menggunakan sliding window untuk akurasi lebih baik.
 */
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(25, '60 s'),
  analytics: true,
});

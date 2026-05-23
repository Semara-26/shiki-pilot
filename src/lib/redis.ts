import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Inisialisasi Upstash Redis Client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate Limiter untuk endpoint umum (AI Chat, dsb).
 * Batas: 25 request per 60 detik (1 menit).
 */
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(25, "60 s"),
  analytics: true,
});

/**
 * Rate Limiter WA — Lapisan 1: Per menit
 * Batas: 10 pesan per 60 detik per nomor pengirim.
 * Mencegah burst spam dalam waktu singkat.
 */
export const waRatelimitMinute = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "wa_rl_min",
  analytics: true,
});

/**
 * Rate Limiter WA — Lapisan 2: Per hari
 * Batas: 100 pesan per 24 jam per nomor pengirim.
 * Mencegah abuse harian yang menguras kuota AI.
 */
export const waRatelimitDaily = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "86400 s"),
  prefix: "wa_rl_day",
  analytics: true,
});

import { ratelimit, waRatelimitMinute, waRatelimitDaily } from "./redis";

export type RateLimitResult = {
  allowed: boolean;
  count: number;
  remaining: number;
  limit: number;
  reset: number;
};

export type WaRateLimitResult = {
  allowed: boolean;
  /** 'minute' | 'daily' | null — layer mana yang nge-block */
  blockedBy: 'minute' | 'daily' | null;
  resetMinute: number;
  resetDaily: number;
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

/**
 * Rate limit berlapis untuk WA Webhook (Opsi D):
 * - Lapisan 1: maks 10 pesan / menit per nomor pengirim
 * - Lapisan 2: maks 100 pesan / hari per nomor pengirim
 *
 * Gunakan rawSender (JID / nomor apa adanya) sebagai identifier
 * agar key Redis tidak bisa dimanipulasi lewat format nomor berbeda.
 */
export async function checkWaRateLimit(senderKey: string): Promise<WaRateLimitResult> {
  const fallback: WaRateLimitResult = {
    allowed: true,
    blockedBy: null,
    resetMinute: Date.now() + 60_000,
    resetDaily: Date.now() + 86_400_000,
  };

  try {
    // Cek lapisan menit terlebih dahulu (lebih murah & cepat)
    const minResult = await waRatelimitMinute.limit(senderKey);
    if (!minResult.success) {
      console.warn(`[WA RateLimit] 🚫 Blocked by MINUTE limit — sender: ${senderKey}`);
      return {
        allowed: false,
        blockedBy: 'minute',
        resetMinute: minResult.reset,
        resetDaily: Date.now() + 86_400_000,
      };
    }

    // Cek lapisan harian
    const dayResult = await waRatelimitDaily.limit(senderKey);
    if (!dayResult.success) {
      console.warn(`[WA RateLimit] 🚫 Blocked by DAILY limit — sender: ${senderKey}`);
      return {
        allowed: false,
        blockedBy: 'daily',
        resetMinute: minResult.reset,
        resetDaily: dayResult.reset,
      };
    }

    return {
      allowed: true,
      blockedBy: null,
      resetMinute: minResult.reset,
      resetDaily: dayResult.reset,
    };
  } catch (err) {
    // Jika Redis gagal, fail-open agar layanan tidak terhenti
    console.error('[WA RateLimit] Redis error, failing open:', err instanceof Error ? err.message : String(err));
    return fallback;
  }
}

"use server";

import { auth } from "@clerk/nextjs/server";

export async function getWaStatus() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { connected: false, error: "Unauthorized" };
    }

    const WA_GATEWAY_URL = process.env.WA_GATEWAY_URL;
    const WA_API_KEY = process.env.WA_API_KEY;

    if (!WA_GATEWAY_URL || !WA_API_KEY) {
      return { connected: false, error: "Sistem Gateway WhatsApp belum dikonfigurasi di server." };
    }

    const res = await fetch(`${WA_GATEWAY_URL}/api/wa-status`, {
      method: "GET",
      headers: {
        "x-api-key": WA_API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { connected: false, error: "Gagal terhubung ke Gateway WA." };
    }

    const data = await res.json();
    return {
      connected: data.connected ?? false,
      qr: data.qr ?? null,
    };
  } catch (err) {
    console.error("WA Gateway check error:", err);
    return { connected: false, error: "Server tidak bisa terhubung ke Gateway (Offline)." };
  }
}

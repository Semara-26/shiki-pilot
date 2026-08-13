"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/src/lib/supabase/server";
import type { OnboardingStatus } from "@/src/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Membaca kolom `onboarding_status` dari baris profil pengguna aktif.
 *
 * Autentikasi: Menggunakan `auth()` dari Clerk untuk mendapatkan userId.
 * Database: Menggunakan Service Role Key — melewati RLS secara sah dari server.
 */
export async function getOnboardingStatus(): Promise<
  OnboardingActionResult<OnboardingStatus>
> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Pengguna tidak terautentikasi." };
  }

  try {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_status")
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 = baris tidak ditemukan (profil belum dibuat), itu kondisi normal
      if (error.code === "PGRST116") {
        return { success: true, data: {} };
      }
      throw new Error(error.message);
    }

    return {
      success: true,
      data: (data?.onboarding_status as OnboardingStatus) ?? {},
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal membaca status onboarding dari database.";
    console.error("[onboarding-actions] getOnboardingStatus error:", err);
    return { success: false, error: message };
  }
}

/**
 * Menandai satu kunci tur sebagai selesai (`true`) secara parsial.
 *
 * Strategi: Read-Merge-Write yang aman — membaca status saat ini, menggabungkan
 * dengan patch baru, lalu menyimpan kembali. Tidak ada key lain yang ikut terhapus.
 *
 * Autentikasi: userId diambil dari sesi Clerk di sisi server — tidak bisa dipalsukan
 * oleh client.
 *
 * @param tourKey - Kunci tur yang ingin ditandai selesai.
 */
export async function markTourAsDone(
  tourKey: keyof OnboardingStatus
): Promise<OnboardingActionResult<OnboardingStatus>> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Pengguna tidak terautentikasi." };
  }

  try {
    const supabase = createSupabaseAdmin();

    // Baca status terkini agar patch bersifat aditif (tidak merusak key lain)
    const { data: current, error: readError } = await supabase
      .from("profiles")
      .select("onboarding_status")
      .eq("user_id", userId)
      .single();

    // Jika baris belum ada (PGRST116), kita mulai dari objek kosong
    const existingStatus: OnboardingStatus =
      readError?.code === "PGRST116"
        ? {}
        : ((current?.onboarding_status as OnboardingStatus) ?? {});

    if (readError && readError.code !== "PGRST116") {
      throw new Error(readError.message);
    }

    const mergedStatus: OnboardingStatus = {
      ...existingStatus,
      [tourKey]: true,
    };

    // Upsert: jika baris ada, update; jika tidak ada, insert
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, onboarding_status: mergedStatus },
        { onConflict: "user_id" }
      );

    if (upsertError) throw new Error(upsertError.message);

    return { success: true, data: mergedStatus };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : `Gagal menyimpan status tur '${tourKey}'.`;
    console.error("[onboarding-actions] markTourAsDone error:", err);
    return { success: false, error: message };
  }
}

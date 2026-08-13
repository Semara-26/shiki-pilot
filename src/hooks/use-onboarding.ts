"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getOnboardingStatus,
  markTourAsDone as markTourAsDoneAction,
} from "@/src/actions/onboarding-actions";
import type { OnboardingStatus } from "@/src/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Kunci tur yang valid. Setiap kunci merepresentasikan satu fitur/halaman
 * yang memiliki panduan onboarding via driver.js.
 */
export type TourKey = keyof OnboardingStatus;

export type UseOnboardingReturn = {
  /** Status onboarding saat ini. null = belum dimuat. */
  onboardingStatus: OnboardingStatus | null;
  /** true selama fetch/update sedang berjalan */
  isLoading: boolean;
  /** Error terakhir jika ada */
  error: string | null;
  /** Muat ulang status dari server */
  fetchOnboardingStatus: () => Promise<void>;
  /** Tandai satu tur sebagai selesai (via Server Action) */
  markTourAsDone: (tourKey: TourKey) => Promise<void>;
  /** Cek apakah tur tertentu sudah selesai */
  isTourDone: (tourKey: TourKey) => boolean;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * `useOnboarding` — Custom hook untuk membaca dan memperbarui status tur
 * onboarding pengguna.
 *
 * Arsitektur (Opsi A - Service Role Only):
 * - Semua komunikasi database dilakukan via Next.js Server Actions.
 * - Server Action menggunakan `auth()` dari Clerk untuk verifikasi identitas
 *   dan `createSupabaseAdmin()` (Service Role Key) untuk akses database.
 * - Hook ini TIDAK menyentuh Supabase secara langsung dari browser —
 *   tidak ada Anon Key yang terekspos ke jaringan untuk tujuan ini.
 *
 * UX Optimizations:
 * - `markTourAsDone` melakukan optimistic update (update lokal dahulu)
 *   agar UI terasa responsif, lalu disinkronkan dengan hasil dari server.
 * - Jika server action gagal, state lokal otomatis di-rollback.
 *
 * @example
 * const { isTourDone, markTourAsDone, fetchOnboardingStatus } = useOnboarding();
 * useEffect(() => { fetchOnboardingStatus(); }, [fetchOnboardingStatus]);
 * if (!isTourDone('dashboardTourDone')) { startTour(); }
 */
export function useOnboarding(): UseOnboardingReturn {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── fetchOnboardingStatus ────────────────────────────────────────────────
  /**
   * Memanggil Server Action `getOnboardingStatus` untuk membaca status
   * dari Supabase via Service Role (server-side).
   */
  const fetchOnboardingStatus = useCallback(async () => {
    if (!isUserLoaded || !isSignedIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getOnboardingStatus();

      if (!result.success) {
        throw new Error(result.error);
      }

      setOnboardingStatus(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat status onboarding.";
      setError(message);
      console.error("[useOnboarding] fetchOnboardingStatus error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isUserLoaded, isSignedIn]);

  // ── markTourAsDone ───────────────────────────────────────────────────────
  /**
   * Menandai tur tertentu sebagai selesai via Server Action.
   *
   * Alur:
   * 1. Optimistic update: state lokal langsung diperbarui agar UI responsif.
   * 2. Server Action dipanggil untuk persisten ke Supabase.
   * 3. State lokal disinkronkan dengan hasil akhir dari server.
   * 4. Jika server gagal, state lokal di-rollback ke nilai sebelumnya.
   *
   * @param tourKey - Kunci tur yang ingin ditandai selesai.
   */
  const markTourAsDone = useCallback(
    async (tourKey: TourKey) => {
      if (!isUserLoaded || !isSignedIn) return;

      // Simpan snapshot untuk rollback jika diperlukan
      const previousStatus = onboardingStatus;

      // Optimistic update — perbarui UI sebelum server merespons
      setOnboardingStatus((prev) => ({
        ...(prev ?? {}),
        [tourKey]: true,
      }));

      try {
        const result = await markTourAsDoneAction(tourKey);

        if (!result.success) {
          throw new Error(result.error);
        }

        // Sinkronkan dengan data canonical dari server
        setOnboardingStatus(result.data);
      } catch (err) {
        // Rollback ke snapshot sebelumnya jika terjadi error
        setOnboardingStatus(previousStatus);

        const message =
          err instanceof Error
            ? err.message
            : `Gagal menyimpan status tur '${tourKey}'.`;
        setError(message);
        console.error("[useOnboarding] markTourAsDone error:", err);
      }
    },
    [isUserLoaded, isSignedIn, onboardingStatus]
  );

  // ── isTourDone ────────────────────────────────────────────────────────────
  /**
   * Cek apakah tur tertentu sudah pernah diselesaikan pengguna.
   */
  const isTourDone = useCallback(
    (tourKey: TourKey): boolean => {
      return onboardingStatus?.[tourKey] === true;
    },
    [onboardingStatus]
  );

  return {
    onboardingStatus,
    isLoading,
    error,
    fetchOnboardingStatus,
    markTourAsDone,
    isTourDone,
  };
}

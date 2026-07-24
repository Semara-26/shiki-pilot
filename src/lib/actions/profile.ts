"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { profiles } from "@/src/db/schema";
import { createSupabaseClient } from "@/src/lib/supabase/server";

export interface UserProfile {
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Ambil profil pengguna yang sedang login dari tabel profiles.
 * Jika belum ada, kembalikan null.
 */
export async function getProfile(): Promise<UserProfile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await db
    .select({ displayName: profiles.displayName, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Simpan atau perbarui profil pengguna.
 * Jika avatarFile tersedia, upload ke Supabase Storage bucket "avatars" terlebih dahulu.
 */
export async function upsertProfile(
  displayName: string,
  avatarFile?: File | null,
): Promise<{ success: boolean; error?: string; avatarUrl?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Tidak terautentikasi." };

  let finalAvatarUrl: string | undefined;

  // Upload avatar jika ada file baru
  if (avatarFile && avatarFile.size > 0) {
    try {
      const supabase = createSupabaseClient();
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const filePath = `${userId}/avatar.${ext}`;

      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
          contentType: avatarFile.type,
          upsert: true, // Timpa jika sudah ada
        });

      if (uploadError) {
        console.error("[upsertProfile] Upload error:", uploadError.message);
        return { success: false, error: `Gagal upload avatar: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Tambahkan timestamp untuk busting cache browser
      finalAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    } catch (err) {
      console.error("[upsertProfile] Unexpected upload error:", err);
      return { success: false, error: "Gagal mengupload avatar." };
    }
  }

  // UPSERT ke tabel profiles
  try {
    const upsertData: { userId: string; displayName: string; updatedAt: Date; avatarUrl?: string } = {
      userId,
      displayName,
      updatedAt: new Date(),
    };
    if (finalAvatarUrl !== undefined) {
      upsertData.avatarUrl = finalAvatarUrl;
    }

    await db
      .insert(profiles)
      .values(upsertData)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          displayName,
          updatedAt: new Date(),
          ...(finalAvatarUrl !== undefined ? { avatarUrl: finalAvatarUrl } : {}),
        },
      });

    return { success: true, avatarUrl: finalAvatarUrl };
  } catch (err) {
    console.error("[upsertProfile] DB error:", err);
    return { success: false, error: "Gagal menyimpan profil ke database." };
  }
}

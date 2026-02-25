'use server';

import { auth } from '@clerk/nextjs/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../db';
import { stores, chats, messages } from '../../db/schema';

/**
 * Mendapatkan atau membuat chat untuk toko current user (Single Thread: satu ruang obrolan per toko).
 * Jika toko sudah punya chat, return chat_id. Jika belum, insert baru lalu return chat_id.
 */
export async function getOrCreateChat(): Promise<{ chatId: string } | { error: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return { error: 'Buat toko terlebih dahulu.' };
    }

    const existing = await db.query.chats.findFirst({
      where: eq(chats.storeId, userStore.id),
      columns: { id: true },
    });

    if (existing) {
      return { chatId: existing.id };
    }

    const [inserted] = await db
      .insert(chats)
      .values({ storeId: userStore.id })
      .returning({ id: chats.id });

    return { chatId: inserted.id };
  } catch (err) {
    console.error('getOrCreateChat error:', err);
    return {
      error: err instanceof Error ? err.message : 'Gagal membuat atau mengambil chat.',
    };
  }
}

/**
 * Mengambil riwayat pesan dari database berdasarkan chat_id, urut ASC by created_at.
 */
export async function getChatHistory(
  chatId: string
): Promise<{ messages: { id: string; role: string; content: string }[] } | { error: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login.' };
    }

    const chatWithStore = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      columns: { id: true, storeId: true },
    });
    if (!chatWithStore) {
      return { error: 'Chat tidak ditemukan.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore || userStore.id !== chatWithStore.storeId) {
      return { error: 'Akses ditolak.' };
    }

    const rows = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));

    return { messages: rows };
  } catch (err) {
    console.error('getChatHistory error:', err);
    return {
      error: err instanceof Error ? err.message : 'Gagal mengambil riwayat chat.',
    };
  }
}

/**
 * Menyimpan pesan baru ke tabel messages.
 */
export async function saveMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<{ success: true } | { error: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Anda harus login.' };
    }

    const chatWithStore = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      columns: { id: true, storeId: true },
    });
    if (!chatWithStore) {
      return { error: 'Chat tidak ditemukan.' };
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore || userStore.id !== chatWithStore.storeId) {
      return { error: 'Akses ditolak.' };
    }

    await db.insert(messages).values({
      chatId,
      role,
      content,
    });

    return { success: true };
  } catch (err) {
    console.error('saveMessage error:', err);
    return {
      error: err instanceof Error ? err.message : 'Gagal menyimpan pesan.',
    };
  }
}

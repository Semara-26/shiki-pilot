import { auth } from '@clerk/nextjs/server';
import { eq, and, isNotNull, cosineDistance } from 'drizzle-orm';
import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { db } from '../../../db';
import { stores } from '../../../db/schema';
import { products } from '../../../db/schema';

const EMBEDDING_DIMENSIONS = 768;
const RAG_TOP_K = 3;

function getTextFromMessageParts(parts: unknown[] | undefined): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .filter((p): p is { type: string; text?: string } => p != null && typeof p === 'object' && 'type' in p && (p as { type: string }).type === 'text')
    .map((p) => (p.text ?? '') as string)
    .join('');
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true },
    });
    if (!userStore) {
      return new Response('Buat toko terlebih dahulu.', { status: 400 });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const lastUserMessage = [...messages].reverse().find(
      (m: { role?: string }) => m?.role === 'user'
    );
    const queryText = lastUserMessage
      ? getTextFromMessageParts(lastUserMessage.parts)
      : '';

    let systemPrompt =
      'Kamu adalah asisten toko bernama ShikiPilot. Jawab pertanyaan dengan ramah dan singkat.';

    if (queryText.trim()) {
      const embeddingModel = google.textEmbeddingModel('gemini-embedding-001');
      const { embedding: rawEmbedding } = await embed({
        model: embeddingModel,
        value: queryText,
      });
      const embeddingArray = Array.isArray(rawEmbedding)
        ? rawEmbedding
        : (rawEmbedding as unknown as number[]);
      const queryEmbedding =
        embeddingArray.length > EMBEDDING_DIMENSIONS
          ? embeddingArray.slice(0, EMBEDDING_DIMENSIONS)
          : embeddingArray.length < EMBEDDING_DIMENSIONS
            ? [
                ...embeddingArray,
                ...new Array(EMBEDDING_DIMENSIONS - embeddingArray.length).fill(
                  0
                ),
              ]
            : embeddingArray;

      const similarProducts = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          stock: products.stock,
          description: products.description,
        })
        .from(products)
        .where(
          and(
            eq(products.storeId, userStore.id),
            isNotNull(products.embedding)
          )
        )
        .orderBy(cosineDistance(products.embedding, queryEmbedding))
        .limit(RAG_TOP_K);

      if (similarProducts.length > 0) {
        const productData = similarProducts
          .map(
            (p) =>
              `- ${p.name}: Rp ${p.price}, stok ${p.stock}. Deskripsi: ${p.description}`
          )
          .join('\n');
        systemPrompt = `Kamu adalah asisten toko bernama ShikiPilot. Jawab pertanyaan berdasarkan data produk berikut. Jika tidak ada di data, jawab dengan sopan bahwa kamu tidak tahu.\n\nData Produk:\n${productData}`;
      } else {
        systemPrompt =
          'Kamu adalah asisten toko bernama ShikiPilot. Saat ini belum ada data produk. Jawab dengan sopan bahwa informasi produk belum tersedia.';
      }
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-flash-latest'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(
      err instanceof Error ? err.message : 'Terjadi kesalahan',
      { status: 500 }
    );
  }
}

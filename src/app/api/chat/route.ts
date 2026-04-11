import { auth } from '@clerk/nextjs/server';
import { eq, sum } from 'drizzle-orm';
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { db } from '../../../db';
import { stores, products, transactions } from '../../../db/schema';
import { ratelimit } from '@/src/lib/redis';
import { updateProductStockThreshold } from '@/src/lib/actions/product';

function formatRp(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { success, limit, reset, remaining } = await ratelimit.limit(userId);
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Asisten AI sedang memproses banyak data, mohon tunggu sekitar satu menit.' }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          } 
        }
      );
    }

    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true, name: true },
    });
    if (!userStore) {
      return new Response('Buat toko terlebih dahulu.', { status: 400 });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    // Fetch full inventory + aggregated sales in parallel for efficiency
    const [allProducts, salesAgg] = await Promise.all([
      // 1. All active products — no limit, full picture
      db
        .select({
          name: products.name,
          price: products.price,
          stock: products.stock,
          stockCritical: products.stockCritical,
        })
        .from(products)
        .where(eq(products.storeId, userStore.id)),

      // 2. Aggregated sales: total qty sold & revenue per product
      db
        .select({
          productName: products.name,
          totalQty: sum(transactions.quantity),
          totalRevenue: sum(transactions.totalPrice),
        })
        .from(transactions)
        .innerJoin(products, eq(transactions.productId, products.id))
        .where(eq(transactions.storeId, userStore.id))
        .groupBy(products.id, products.name),
    ]);

    // Build compact inventory snapshot (now includes stock_critical threshold)
    const inventorySection =
      allProducts.length > 0
        ? allProducts
            .map(
              (p) =>
                `- ${p.name} | Harga: ${formatRp(p.price)} | Stok: ${p.stock === 0 ? '0 (HABIS)' : p.stock} | Batas Kritis: ${p.stockCritical}`
            )
            .join('\n')
        : '(Belum ada produk di katalog)';

    // Build compact sales performance snapshot
    const salesSection =
      salesAgg.length > 0
        ? salesAgg
            .map(
              (s) =>
                `- ${s.productName} | Terjual: ${s.totalQty ?? 0} unit | Pendapatan: ${formatRp(Number(s.totalRevenue ?? 0))}`
            )
            .join('\n')
        : '(Belum ada transaksi penjualan tercatat)';

    const systemPrompt = `Kamu adalah asisten bisnis cerdas ShikiPilot untuk toko "${userStore.name}". Tugasmu membantu pemilik toko menganalisis stok dan performa penjualan.

=== INVENTARIS SAAT INI ===
${inventorySection}

=== PERFORMA PENJUALAN (KUMULATIF) ===
${salesSection}
(Produk yang tidak tercantum di atas belum pernah terjual)

Gunakan data di atas untuk menjawab setiap pertanyaan. Berikan jawaban dalam Bahasa Indonesia yang ramah, ringkas, dan profesional. Jika ditanya sesuatu di luar data ini, sampaikan dengan jujur bahwa kamu tidak memiliki informasinya.

PENTING - TERKAIT TOOL:
Jika pengguna menginstruksikan untuk mengubah, mengatur, atau memperbarui batas aman (threshold/kritis) suatu produk, JANGAN hanya menjawab dengan teks. Kamu WAJIB memanggil tool yang tersedia untuk mengeksekusi perubahan tersebut ke database secara langsung. Setelah tool selesai, beritahu pengguna hasilnya dalam Bahasa Indonesia.`;

    const modelMessages = await convertToModelMessages(messages);

    const storeId = userStore.id;

    const result = streamText({
      model: google('gemini-flash-latest'),
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(3),
      tools: {
        updateStockThreshold: tool({
          description:
            'Gunakan tool ini KHUSUS saat pengguna meminta untuk mengubah, mengatur, atau memperbarui batas stok aman/kritis suatu produk. Tool ini akan langsung menyimpan perubahan ke database.',
          inputSchema: z.object({
            productName: z
              .string()
              .describe('Nama produk yang batas stok kritisnya ingin diubah'),
            newThreshold: z
              .number()
              .int()
              .min(0)
              .describe('Nilai batas stok kritis yang baru (bilangan bulat, >= 0)'),
          }),
          execute: async ({ productName, newThreshold }) => {
            const result = await updateProductStockThreshold(storeId, productName, newThreshold);
            return result.message;
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(
      JSON.stringify({
        error:
          'Maaf, asisten AI sedang mengalami gangguan koneksi. Silakan coba beberapa saat lagi.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

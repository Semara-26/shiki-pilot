import { auth } from '@clerk/nextjs/server';
import { eq, sum } from 'drizzle-orm';
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { db } from '../../../db';
import { stores, products, transactions } from '../../../db/schema';
import { checkRateLimit } from '@/src/lib/rate-limit';

function formatRp(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { allowed } = await checkRateLimit(userId);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Asisten AI sedang memproses banyak data, mohon tunggu sekitar satu menit.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
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

    // Build compact inventory snapshot
    const inventorySection =
      allProducts.length > 0
        ? allProducts
            .map(
              (p) =>
                `- ${p.name} | Harga: ${formatRp(p.price)} | Stok: ${p.stock === 0 ? '0 (HABIS)' : p.stock}`
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

Gunakan data di atas untuk menjawab setiap pertanyaan. Berikan jawaban dalam Bahasa Indonesia yang ramah, ringkas, dan profesional. Jika ditanya sesuatu di luar data ini, sampaikan dengan jujur bahwa kamu tidak memiliki informasinya.`;

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

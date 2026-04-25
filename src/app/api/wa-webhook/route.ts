import { NextRequest, NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { eq, ilike, and } from "drizzle-orm";
import { db } from "../../../db";
import { stores, products } from "../../../db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Normalize nomor WA (strip non-digit, 0xxx → 62xxx)
// ─────────────────────────────────────────────────────────────────────────────
function normalizePhone(phone: string): string {
  if (!phone) return "";
  // Hapus semua karakter selain angka
  let cleaned = phone.replace(/\D/g, "");
  // Jika berawalan 0, ganti dengan 62 (standar internasional Indonesia)
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Kirim balasan ke WA Gateway → /send-message
// ─────────────────────────────────────────────────────────────────────────────
async function sendWaReply(to: string, text: string) {
  const gatewayUrl = process.env.WA_GATEWAY_URL;
  const apiKey = process.env.WA_API_KEY;

  if (!gatewayUrl || !apiKey) {
    console.error("[WA Webhook] WA_GATEWAY_URL atau WA_API_KEY belum diset.");
    return;
  }

  try {
    const res = await fetch(`${gatewayUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ to, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[WA Webhook] Gagal kirim balasan (${res.status}):`, body);
    } else {
      console.log(`[WA Webhook] ✅ Balasan terkirim ke ${to}`);
    }
  } catch (err) {
    console.error("[WA Webhook] Error saat kirim ke gateway:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/wa-webhook
// Body : { senderNumber: string, messageText: string }
// Header: x-api-key
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth: validasi x-api-key
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.WA_API_KEY;
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { senderNumber, senderJid, messageText } = body as {
    senderNumber?: string;
    senderJid?: string;
    messageText?: string;
  };

  const rawJid = senderJid || senderNumber;

  if (typeof rawJid !== "string" || typeof messageText !== "string") {
    return NextResponse.json(
      { error: "senderNumber/senderJid and messageText are required strings" },
      { status: 400 },
    );
  }

  console.log("[WA Webhook] Incoming message:", { rawJid, messageText });

  // 3. Normalize nomor pengirim & cari toko
  const rawSender = senderNumber || senderJid || "";
  const normalizedSender = normalizePhone(rawSender);

  console.log(
    `[WA Webhook] Mencari toko... Raw: ${rawSender} | Normalized: ${normalizedSender}`,
  );

  // Lookup fleksibel: cocokkan suffix 8-12 digit terakhir agar toleran terhadap
  // perbedaan format (misal: DB simpan "08xxx" vs pengirim kirim "628xxx").
  // Ambil 8 digit terakhir sebagai kunci pencocokan.
  const suffix = normalizedSender.slice(-10);

  const store = await db.query.stores.findFirst({
    where: ilike(stores.whatsappNumber, `%${suffix}`),
    columns: { id: true, name: true, whatsappNumber: true },
  });

  if (!store) {
    console.warn(
      `[WA Webhook] Tidak ada toko terdaftar untuk nomor: ${normalizedSender} (suffix: ${suffix})`,
    );

    // ── Cek apakah ini perintah LINK# ────────────────────────────────────────
    const linkMatch = messageText.trim().match(/^LINK#(.+)$/i);

    if (linkMatch) {
      // Ekstrak & normalisasi nomor HP yang dikirim setelah tanda #
      const linkedRaw = linkMatch[1].trim();
      const linkedNormalized = normalizePhone(linkedRaw);
      const linkedSuffix = linkedNormalized.slice(-10);

      console.log(
        `[WA Webhook] LINK# request — raw: ${linkedRaw} | normalized: ${linkedNormalized}`,
      );

      // Cari toko berdasarkan nomor yang disertakan di LINK#
      const targetStore = await db.query.stores.findFirst({
        where: ilike(stores.whatsappNumber, `%${linkedSuffix}`),
        columns: { id: true, name: true },
      });

      if (!targetStore) {
        await sendWaReply(
          rawJid,
          `❌ Nomor *${linkedRaw}* tidak ditemukan di ShikiPilot.\n\nPastikan nomor yang Bos masukkan sudah terdaftar sebagai nomor toko. Coba lagi dengan format:\n\nLINK#Nomor_HP_Toko\nContoh: LINK#081234567890`,
        );
        return NextResponse.json({ status: "link_target_not_found" }, { status: 200 });
      }

      // Update whatsapp_number toko dengan rawSender (JID/LID perangkat ini)
      await db
        .update(stores)
        .set({ whatsappNumber: rawSender })
        .where(eq(stores.id, targetStore.id));

      console.log(
        `[WA Webhook] ✅ Perangkat ${rawSender} berhasil ditautkan ke toko "${targetStore.name}"`,
      );

      await sendWaReply(
        rawJid,
        `✅ Perangkat berhasil ditautkan ke toko *${targetStore.name}*!\n\nSekarang Bos bisa cek stok atau transaksi langsung dari sini. Ada yang bisa dibantu?`,
      );
      return NextResponse.json({ status: "linked", store: targetStore.name }, { status: 200 });
    }

    // Bukan perintah LINK# — kirim panduan cara menautkan
    await sendWaReply(
      rawJid,
      `Halo! 🤖 Perangkat WA ini belum terhubung ke ShikiPilot.\n\nUntuk menautkan, silakan balas pesan ini dengan format:\n\nLINK#Nomor_HP_Toko\n\nContoh: LINK#081234567890`,
    );
    return NextResponse.json({ status: "no_store_found" }, { status: 200 });
  }

  console.log(`[WA Webhook] Toko ditemukan: "${store.name}" (id: ${store.id})`);

  // --- FITUR LOADING FEEDBACK ---
  const loadingMessages = [
    "Siap Bos! ShikiPilot lagi lari ke gudang bentar ya... 🏃💨",
    "Oke Bos, perintah diterima. Mohon tunggu sebentar, lagi proses data... ⏳",
    "Tunggu sebentar ya Bos, ShikiPilot lagi catat ke sistem... 📋",
    "Siapp! Lagi sinkronisasi ke database, mohon ditunggu 🚀"
  ];
  const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  // Kirim pesan loading ke WA Gateway tanpa await agar tidak memblokir AI
  sendWaReply(rawJid, randomLoading);
  // -----------------------------

  // 4. Jalankan AI - Langkah 1: Deteksi Niat (Tool Calling Manual)
  try {
    const step1 = await generateText({
      model: google("gemini-flash-latest"),
      system: `Kamu adalah asisten gudang. Tugasmu menganalisis pesan user dan memutuskan apakah perlu cek stok atau update stok.
ATURAN WAJIB: Jika kamu memanggil tool 'updateStock', kamu TIDAK BOLEH membiarkan parameternya kosong. Kamu WAJIB mengekstrak nama produk, angka, dan jenis operasinya dari pesan user!`,
      messages: [{ role: "user", content: messageText }],
      tools: {
        checkStock: tool({
          description:
            "Gunakan ini jika user menanyakan stok produk spesifik atau ketersediaan barang.",
          parameters: z.object({
            nama_produk: z
              .string()
              .optional()
              .describe("Nama produk yang dicari."),
          }),
          execute: async () => {}, // Tidak dipanggil karena flow manual
        } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        updateStock: tool({
          description: 'Gunakan saat user minta update, restok, atau set stok barang. Bisa 1 atau banyak barang sekaligus.',
          parameters: z.object({
            items: z.array(z.object({
              nama_produk: z.string().describe("Nama produk"),
              jumlah: z.string().describe("Angka jumlah stok"),
              operasi: z.string().describe('Tulis "set", "add", atau "subtract"')
            })).describe("Daftar produk yang diupdate")
          }),
          execute: async () => {}, // Tidak dipanggil karena flow manual
        } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        checkLowStock: tool({
          description:
            "Gunakan ini jika user menanyakan rekap stok yang hampir habis, menipis, atau kritis.",
          parameters: z.object({}),
          execute: async () => {}, // Tidak dipanggil karena flow manual
        } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });

    let finalReply =
      step1.text || "Maaf Bos, AI lagi loading bentar, coba tanya lagi ya.";

    // LANGKAH 2 & 3: Evaluasi Tool Calls Secara Manual
    if (step1.toolCalls && step1.toolCalls.length > 0) {
      const tCall = step1.toolCalls[0] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      let dbData = "";

      if (tCall.toolName === "checkStock") {
        const args = tCall.args || tCall.input || {};
        const rawProductName = args.nama_produk || args.product_name || args.product || args.name || args.item;
        const keyword = rawProductName?.trim() || "";
        console.log(`[Manual Tool] checkStock: "${keyword}"`);

        const results = await db
          .select({
            name: products.name,
            stock: products.stock,
            price: products.price,
            stockCritical: products.stockCritical,
          })
          .from(products)
          .where(
            and(
              eq(products.storeId, store.id),
              keyword ? ilike(products.name, `%${keyword}%`) : undefined,
            ),
          );

        dbData =
          results.length > 0
            ? JSON.stringify(results)
            : `Produk "${keyword}" tidak ditemukan.`;
      } else if (tCall.toolName === "updateStock") {
        const args = tCall.args || tCall.input || {};
        // Tangkap array-nya (AI kadang pakai key 'items', 'data', atau 'produk')
        const rawItems = args.items || args.data || args.produk || [];
        
        // Kalau AI cuma kirim 1 barang dan lupa pakai array, kita bungkus jadi array
        const itemsToProcess = Array.isArray(rawItems) ? rawItems : [args];

        const dbDataArray: string[] = [];

        for (const item of itemsToProcess) {
          const rawProductName = item.nama_produk || item.product_name || item.product || item.name || item.item;
          const rawQuantity = item.jumlah || item.quantity || item.qty || item.amount;
          const rawOperation = item.operasi || item.operation || item.type || item.action || item.op;

          if (!rawProductName || !rawQuantity || !rawOperation) {
            dbDataArray.push(`- Gagal parsing salah satu item.`);
            continue;
          }

          const qtyNumber = Number(rawQuantity);
          let op = String(rawOperation).toLowerCase();
          if (op.includes('tambah') || op.includes('add')) op = 'add';
          else if (op.includes('kurang') || op.includes('sub')) op = 'subtract';
          else op = 'set';

          const keyword = String(rawProductName).trim();
          const productList = await db.select().from(products)
            .where(and(eq(products.storeId, store.id), ilike(products.name, `%${keyword}%`)));

          if (productList.length === 0) {
            dbDataArray.push(`- Gagal: Produk "${keyword}" tidak ditemukan.`);
          } else {
            const targetProduct = productList[0];
            let newStock = targetProduct.stock;
            
            if (op === 'add') newStock += qtyNumber;
            else if (op === 'subtract') newStock -= qtyNumber;
            else if (op === 'set') newStock = qtyNumber;

            await db.update(products)
              .set({ stock: newStock })
              .where(eq(products.id, targetProduct.id));
              
            dbDataArray.push(`- SUKSES: "${targetProduct.name}" jadi ${newStock} pcs.`);
          }
        }

        // Gabungkan hasil loop jadi 1 string untuk dibaca AI kedua
        const dbData = `[HASIL DATABASE]:\n${dbDataArray.join('\n')}`;

        // Panggil AI Kedua
        const step2 = await generateText({
          model: google('gemini-flash-latest'),
          system: `Kamu adalah ShikiPilot AI untuk toko "${store.name}". Jawab santai, rekap hasilnya, dan kasih tau kalau ada yang gagal. \nINFO DATABASE:\n${dbData}`,
          messages: [{ role: 'user', content: messageText }],
        });
        
        const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        finalReply = step2.text + `\n\n🔗 Kelola inventaris:\n${appUrl}/dashboard/inventory`;
      } else if (tCall.toolName === "checkLowStock") {
        console.log("[Manual Tool] checkLowStock");

        const lowItems = await db
          .select({
            name: products.name,
            stock: products.stock,
            stockCritical: products.stockCritical,
            stockWarning: products.stockWarning,
          })
          .from(products)
          .where(eq(products.storeId, store.id));

        const critical = lowItems.filter((p) => p.stock <= p.stockCritical);
        const warning = lowItems.filter(
          (p) => p.stock > p.stockCritical && p.stock <= p.stockWarning,
        );

        dbData =
          critical.length === 0 && warning.length === 0
            ? "Semua stok aman."
            : JSON.stringify({ critical, warning });
      }

      if (dbData) {
        console.log("[Manual Tool] Data didapat, merangkai jawaban akhir...");

        // Panggil AI KEDUA KALINYA untuk merangkai jawaban natural
        const step2 = await generateText({
          model: google("gemini-flash-latest"),
          system: `Kamu adalah ShikiPilot AI untuk toko "${store.name}". Jawablah dengan gaya bahasa yang luwes, singkat, padat, dan on-point seperti manusia biasa (jangan kaku seperti mesin). 
      
INFO DATABASE (Gunakan data ini untuk menjawab pertanyaan):
${dbData}`,
          messages: [{ role: "user", content: messageText }],
        });

        finalReply = step2.text;
      }
    }

    console.log(`[WA Webhook] AI Reply untuk ${rawJid}:`, finalReply);

    // 5. Kirim balasan AI ke pengirim via WA Gateway
    await sendWaReply(rawJid, finalReply);

    return NextResponse.json({ status: "ok", reply: finalReply }, { status: 200 });
  } catch (err) {
    console.error("[WA Webhook] AI error:", err);

    // Fallback: balas dengan pesan error yang ramah
    await sendWaReply(
      rawJid,
      "Maaf Bos, asisten ShikiPilot sedang mengalami gangguan. Coba lagi sebentar ya!",
    );

    return NextResponse.json({ status: "ai_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const PROMPT_TEMPLATE = `Kamu adalah asisten bisnis untuk UMKM. Analisis data penjualan berikut secara singkat (maksimal 3 kalimat) dan gunakan bahasa Indonesia yang kasual. Data: {data}`;

/** Mock response untuk simulasi delay jaringan (2 detik) */
const MOCK_INSIGHT =
  "Revenue cenderung stabil dengan beberapa produk unggulan. Pertimbangkan promosi untuk produk dengan penjualan lebih rendah agar diversifikasi pendapatan meningkat. Tetap pantau stok barang laris untuk antisipasi permintaan.";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { data, dateRange } = body;

    const dataStr = typeof data === "string" ? data : JSON.stringify(data ?? {});
    const prompt = PROMPT_TEMPLATE.replace("{data}", dataStr);

    // Simulasi delay jaringan 2 detik (belum pakai SDK AI asli)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({
      insight: MOCK_INSIGHT,
      _meta: { promptUsed: prompt.slice(0, 100) + "...", dateRange },
    });
  } catch (err) {
    console.error("AI insight API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan", insight: "" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

const PROMPT_TEMPLATE = `Kamu adalah asisten bisnis UMKM yang santai tapi analitis. Bisnis ini beroperasi dengan nama {businessName} dan menjual produk-produk seperti: {productNames}. Berdasarkan data penjualan periode {timeFilter} berikut: {chartDataJson}, berikan insight singkat maksimal 3 kalimat. Soroti tren utama dan berikan satu saran praktis (actionable). Gunakan bahasa Indonesia sehari-hari yang luwes, jangan terdengar seperti robot, dan hindari menyebutkan ulang angka mentah secara kaku.`;

/** Ekstrak nama produk unik dari chartData (topProducts, distribution, dll) */
function extractProductNames(chartData: unknown): string {
  if (!chartData || typeof chartData !== "object") return "berbagai produk";
  const data = chartData as Record<string, unknown>;
  const names = new Set<string>();

  const collectFromArray = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item && typeof item === "object" && "name" in item && typeof (item as { name: unknown }).name === "string") {
        const name = (item as { name: string }).name.trim();
        if (name && !/^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(name) && !/^Week\s+\d+$/i.test(name) && !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(name)) {
          names.add(name);
        }
      }
    }
  };

  collectFromArray(data.topProducts);
  collectFromArray(data.distribution);

  if (names.size === 0) return "berbagai produk";
  return Array.from(names).slice(0, 20).join(", ");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { chartData, timeFilter, businessName } = body;

    const timeFilterStr = String(timeFilter ?? "weekly");
    const businessNameStr = typeof businessName === "string" && businessName.trim() ? businessName.trim() : "Toko User";
    const chartDataJson = typeof chartData === "string" ? chartData : JSON.stringify(chartData ?? {});
    const productNames = extractProductNames(chartData);

    const userPrompt = PROMPT_TEMPLATE
      .replace("{businessName}", businessNameStr)
      .replace("{productNames}", productNames)
      .replace("{timeFilter}", timeFilterStr)
      .replace("{chartDataJson}", chartDataJson);

    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      prompt: userPrompt,
    });

    return NextResponse.json({ insight: text?.trim() ?? "" });
  } catch (err) {
    console.error("AI insight API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan", insight: "" },
      { status: 500 }
    );
  }
}

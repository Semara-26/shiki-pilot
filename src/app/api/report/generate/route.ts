import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../db";
import { stores } from "../../../../db/schema";
import { generateReportData } from "@/src/lib/actions/product";

/**
 * GET /api/report/generate?period=daily|weekly|monthly&format=xlsx
 *
 * Endpoint yang dipanggil oleh tool AI generateReport.
 * Me-return file Excel sebagai download langsung — tidak ada data mentah yang dibaca AI.
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") ?? "xlsx";

    // Validasi parameter
    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({
          error: "Parameter startDate dan endDate wajib diisi.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (format !== "xlsx") {
      return new Response(
        JSON.stringify({
          error:
            "Format yang diminta tidak didukung. Gunakan format 'xlsx'. PDF tersedia di halaman Analytics.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Ambil store milik user yang login
    const userStore = await db.query.stores.findFirst({
      where: eq(stores.userId, userId),
      columns: { id: true, name: true },
    });

    if (!userStore) {
      return new Response(JSON.stringify({ error: "Toko tidak ditemukan." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await generateReportData(userStore.id, startDate, endDate);

    if (!result.success || !result.fileContentBase64) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = Buffer.from(result.fileContentBase64, "base64");

    // Return file sebagai download langsung
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Report generate API error:", err);
    return new Response(
      JSON.stringify({ error: "Gagal membuat laporan. Silakan coba lagi." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

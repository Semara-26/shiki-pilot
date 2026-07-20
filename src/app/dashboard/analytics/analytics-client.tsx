"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Download,
  ChevronDown,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { LOGO_BASE64 } from "@/src/lib/logo-base64";
import { LOGO_NEW_BASE64 } from "@/src/lib/logo-new-base64";
import { SalesChart } from "@/src/components/sales-chart";
import { TopProductsBarChart } from "@/src/components/top-products-bar-chart";
import { ProductDistributionDonut } from "@/src/components/product-distribution-donut";
import { AiInsightBox } from "@/src/components/ai-insight-box";
import type { RawTransaction } from "./page";

export type TimeFilter = "daily" | "weekly" | "monthly";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Fallback raw transactions saat DB kosong */
const FALLBACK_RAW: RawTransaction[] = (() => {
  const products = [
    "Raja Tuna",
    "Kerupuk Tuna Bawang",
    "Sarden Premium",
    "Abon Tuna Pedas",
    "Fish Ball",
  ];
  const out: RawTransaction[] = [];
  const now = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (20 - i));
    const product = products[i % products.length];
    const qty = 2 + (i % 5);
    const price = [28500, 15600, 18900, 22000, 9800][i % 5];
    out.push({
      productName: product,
      quantity: qty,
      totalPrice: price * qty,
      createdAt: d,
    });
  }
  return out;
})();

interface AnalyticsClientProps {
  rawTransactions: RawTransaction[];
  hasStore: boolean;
  businessName?: string;
}

function processRevenueOverTime(
  transactions: RawTransaction[],
  filter: TimeFilter,
): { name: string; value: number }[] {
  if (transactions.length === 0) return [];

  const now = new Date();
  const buckets = new Map<string, number>();

  if (filter === "daily") {
    // Last 14 days, aggregate per day. X-axis: "DD MMM"
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const tx of transactions) {
      const d = new Date(tx.createdAt);
      const key = d.toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
      }
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, value]) => {
        const [, m, day] = dateStr.split("-").map(Number);
        const short = `${String(day).padStart(2, "0")} ${MONTH_LABELS[m - 1]}`;
        return { name: short, value };
      });
  }

  if (filter === "weekly") {
    // Last 8 weeks, aggregate per week. X-axis: "Week 1" .. "Week 8"
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    for (let w = 0; w < 8; w++) buckets.set(`W${w}`, 0);
    for (const tx of transactions) {
      const d = new Date(tx.createdAt);
      const diffMs = now.getTime() - d.getTime();
      const weeksAgo = Math.floor(diffMs / msPerWeek);
      if (weeksAgo >= 0 && weeksAgo < 8) {
        const key = `W${7 - weeksAgo}`;
        buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
      }
    }
    return Array.from({ length: 8 }, (_, i) => ({
      name: `Minggu ${i + 1}`,
      value: buckets.get(`W${i}`) ?? 0,
    }));
  }

  // monthly: Last 12 months. X-axis: "Jan", "Feb", "Mar", ...
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, 0);
  }
  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + tx.totalPrice);
    }
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [, mStr] = key.split("-");
      const m = parseInt(mStr, 10);
      return { name: MONTH_LABELS[m - 1], value };
    });
}

function processTopProducts(
  transactions: RawTransaction[],
): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(
      tx.productName,
      (byProduct.get(tx.productName) ?? 0) + tx.quantity,
    );
  }
  return Array.from(byProduct.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function processDistribution(
  transactions: RawTransaction[],
): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(
      tx.productName,
      (byProduct.get(tx.productName) ?? 0) + tx.totalPrice,
    );
  }
  return Array.from(byProduct.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const DAYS_BY_FILTER: Record<TimeFilter, number> = {
  daily: 14,
  weekly: 56, // 8 weeks
  monthly: 365, // 12 months
};

export function AnalyticsClient({
  rawTransactions,
  hasStore,
  businessName,
}: AnalyticsClientProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const txs = rawTransactions.length > 0 ? rawTransactions : FALLBACK_RAW;

  const filteredTransactions = useMemo(() => {
    const daysBack = DAYS_BY_FILTER[timeFilter];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    cutoff.setHours(0, 0, 0, 0);
    return txs.filter((tx) => new Date(tx.createdAt) >= cutoff);
  }, [txs, timeFilter]);

  const revenueOverTimeData = useMemo(
    () => processRevenueOverTime(filteredTransactions, timeFilter),
    [filteredTransactions, timeFilter],
  );
  const topProductsData = useMemo(
    () => processTopProducts(filteredTransactions),
    [filteredTransactions],
  );
  const distributionData = useMemo(
    () => processDistribution(filteredTransactions),
    [filteredTransactions],
  );

  const chartDataSummary = useMemo(
    () => ({
      revenueOverTime: revenueOverTimeData,
      topProducts: topProductsData,
      distribution: distributionData,
    }),
    [revenueOverTimeData, topProductsData, distributionData],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportOpen]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const MARGIN = 14;
      const CONTENT_W = pageW - MARGIN * 2;

      // ─── Palette ───────────────────────────────────────────────────────────
      const CYAN = [14, 165, 233] as [number, number, number]; // sky-500
      const CYAN_DARK = [3, 105, 161] as [number, number, number]; // sky-700
      const GRAY_LIGHT = [248, 250, 252] as [number, number, number]; // slate-50
      const GRAY_MED = [241, 245, 249] as [number, number, number]; // slate-100
      const GRAY_BORDER = [226, 232, 240] as [number, number, number]; // slate-200
      const GRAY_TEXT = [100, 116, 139] as [number, number, number]; // slate-500
      const DARK_TEXT = [15, 23, 42] as [number, number, number]; // slate-900
      const WHITE = [255, 255, 255] as [number, number, number];

      // ─── Computed summary values ───────────────────────────────────────────
      const formatRp = (val: number) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(val);

      const totalRevenue = filteredTransactions.reduce(
        (s, tx) => s + tx.totalPrice,
        0,
      );
      const totalQty = filteredTransactions.reduce(
        (s, tx) => s + tx.quantity,
        0,
      );
      const uniqueProducts = new Set(
        filteredTransactions.map((tx) => tx.productName),
      ).size;

      const now = new Date();
      const printDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const periodMap: Record<string, string> = {
        daily: "14 Hari Terakhir",
        weekly: "8 Minggu Terakhir",
        monthly: "12 Bulan Terakhir",
      };
      const periodLabel = periodMap[timeFilter] ?? "";

      // ═══════════════════════════════════════════════════════════════════════
      // 1. HEADER BAND (cyan background strip)
      // ═══════════════════════════════════════════════════════════════════════
      const HEADER_H = 28;
      doc.setFillColor(...CYAN);
      doc.rect(0, 0, pageW, HEADER_H, "F");

      // Logo (new brand logo)
      try {
        doc.addImage(LOGO_NEW_BASE64, "PNG", MARGIN, 4, 18, 18);
      } catch {
        // fallback to old logo if new logo fails
        doc.addImage(LOGO_BASE64, "PNG", MARGIN, 4, 18, 18);
      }

      // Brand name
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text("SHIKIPILOT", MARGIN + 21, 13);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(186, 230, 253); // sky-200
      doc.text("LAPORAN ANALITIK PENJUALAN", MARGIN + 21, 19);

      // Right meta block
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      const metaX = pageW - MARGIN;
      doc.text(`Dicetak: ${printDate}`, metaX, 11, { align: "right" });
      doc.text(`Periode: ${periodLabel}`, metaX, 17, { align: "right" });
      if (businessName) {
        doc.text(`Toko: ${businessName}`, metaX, 23, { align: "right" });
      }

      let curY = HEADER_H + 8;

      // ═══════════════════════════════════════════════════════════════════════
      // 2. HIGHLIGHT CARDS (KPI row)
      // ═══════════════════════════════════════════════════════════════════════
      const cards = [
        {
          label: "Total Pendapatan",
          value: formatRp(totalRevenue),
          icon: "💰",
        },
        {
          label: "Total Unit Terjual",
          value: String(totalQty) + " unit",
          icon: "📦",
        },
        {
          label: "Produk Berbeda",
          value: String(uniqueProducts) + " SKU",
          icon: "🏷️",
        },
        {
          label: "Transaksi",
          value: String(filteredTransactions.length) + "x",
          icon: "🧾",
        },
      ];

      const CARD_W = (CONTENT_W - 6) / 4; // 4 cards, 2 mm gap
      const CARD_H = 20;

      cards.forEach((card, i) => {
        const cx = MARGIN + i * (CARD_W + 2);

        // Card background
        doc.setFillColor(...GRAY_LIGHT);
        doc.setDrawColor(...GRAY_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(cx, curY, CARD_W, CARD_H, 2, 2, "FD");

        // Top accent bar
        doc.setFillColor(...CYAN);
        doc.rect(cx, curY, CARD_W, 1.5, "F");

        // Label
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY_TEXT);
        doc.text(card.label.toUpperCase(), cx + CARD_W / 2, curY + 7, {
          align: "center",
        });

        // Value
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK_TEXT);
        doc.text(card.value, cx + CARD_W / 2, curY + 14, { align: "center" });
      });

      curY += CARD_H + 8;

      // ═══════════════════════════════════════════════════════════════════════
      // 3. CHART SCREENSHOT
      // ═══════════════════════════════════════════════════════════════════════
      const chartEl = document.getElementById("revenue-chart-container");
      if (chartEl) {
        const canvas = await html2canvas(chartEl, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgW = CONTENT_W;
        const imgH = (canvas.height * imgW) / canvas.width;

        // Section label
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...CYAN_DARK);
        doc.text("GRAFIK PENDAPATAN", MARGIN, curY);
        doc.setDrawColor(...CYAN);
        doc.setLineWidth(0.5);
        doc.line(MARGIN, curY + 1.5, MARGIN + 40, curY + 1.5);
        curY += 5;

        doc.addImage(imgData, "PNG", MARGIN, curY, imgW, imgH);
        curY += imgH + 8;
      }

      // ═══════════════════════════════════════════════════════════════════════
      // 4. DATA TABLE (zebra-striped, professional)
      // ═══════════════════════════════════════════════════════════════════════

      // Section label
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CYAN_DARK);
      doc.text("DETAIL TRANSAKSI", MARGIN, curY);
      doc.setDrawColor(...CYAN);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, curY + 1.5, MARGIN + 37, curY + 1.5);
      curY += 5;

      const tableRows = filteredTransactions.map((tx) => [
        new Date(tx.createdAt).toLocaleDateString("id-ID"),
        tx.productName,
        { content: String(tx.quantity), styles: { halign: "center" as const } },
        {
          content: formatRp(tx.totalPrice),
          styles: { halign: "right" as const },
        },
      ]);

      const grandTotalRowIdx = tableRows.length;
      const grandTotalRow = [
        { content: "", colSpan: 1 },
        { content: "GRAND TOTAL", styles: { fontStyle: "bold" as const } },
        {
          content: String(totalQty),
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        },
        {
          content: formatRp(totalRevenue),
          styles: { halign: "right" as const, fontStyle: "bold" as const },
        },
      ];

      autoTable(doc, {
        startY: curY,
        margin: { left: MARGIN, right: MARGIN },
        head: [
          [
            { content: "Tanggal", styles: { halign: "left" } },
            { content: "Nama Produk", styles: { halign: "left" } },
            { content: "Kuantitas", styles: { halign: "center" } },
            { content: "Total Pendapatan", styles: { halign: "right" } },
          ],
        ],
        body: [...tableRows, grandTotalRow],
        // Head styling
        headStyles: {
          fillColor: CYAN,
          textColor: WHITE,
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        },
        // Body styling
        styles: {
          fontSize: 7.5,
          textColor: DARK_TEXT,
          lineColor: GRAY_BORDER,
          lineWidth: 0.1,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        },
        // Zebra-stripe: even rows get slight tint
        alternateRowStyles: { fillColor: GRAY_MED },
        // Grand-total row override
        didParseCell: (data) => {
          if (data.section === "body" && data.row.index === grandTotalRowIdx) {
            data.cell.styles.fillColor = GRAY_LIGHT;
            data.cell.styles.lineColor = CYAN as unknown as string;
            data.cell.styles.lineWidth = 0.4;
          }
        },
        // Column widths (proportional)
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 22 },
          3: { cellWidth: 36 },
        },
        // Prevent rows from splitting across pages
        rowPageBreak: "avoid",
        // Footer on every page (page X / Y)
        didDrawPage: (data) => {
          const pageCount = (
            doc as unknown as { internal: { getNumberOfPages(): number } }
          ).internal.getNumberOfPages();
          const pageNum = data.pageNumber;
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...GRAY_TEXT);
          doc.text(
            `ShikiPilot — Laporan Analitik  |  ${printDate}${businessName ? "  |  " + businessName : ""}`,
            MARGIN,
            pageH - 8,
          );
          doc.text(
            `Hal. ${pageNum} / ${pageCount}`,
            pageW - MARGIN,
            pageH - 8,
            { align: "right" },
          );
          // Footer separator line
          doc.setDrawColor(...GRAY_BORDER);
          doc.setLineWidth(0.3);
          doc.line(MARGIN, pageH - 11, pageW - MARGIN, pageH - 11);
        },
      });

      doc.save(
        `Laporan_ShikiPilot_${timeFilter}_${now.toISOString().slice(0, 10)}.pdf`,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Tanggal",
      "Nama Produk",
      "Kuantitas",
      "Total Pendapatan (Rp)",
    ];
    const escapeCsv = (val: string | number) => {
      const s = String(val);
      return s.includes(";") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const rows = filteredTransactions.map((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString("id-ID");
      return [
        escapeCsv(date),
        escapeCsv(tx.productName),
        tx.quantity,
        tx.totalPrice,
      ].join(";");
    });
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shikipilot_report_${timeFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasStore) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink/20 dark:border-white/20 bg-paper dark:bg-white/5">
            <BarChart3 className="h-7 w-7 text-ink dark:text-white" />
          </div>
          <h2 className="font-mono text-base font-black uppercase tracking-wider text-ink dark:text-white">
            Toko Belum Dibuat
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Buat toko terlebih dahulu untuk melihat analytics penjualan.
          </p>
          <Link
            href="/dashboard/create-store"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Buat Toko
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Row 1: Revenue Over Time + Time Filter Toggle */}
      <div className="rounded-lg border-2 border-ink bg-white p-4 md:p-6 dark:border-white/20 dark:bg-[#0a0a0a]">
        <div className="mb-4 flex flex-col gap-3 md:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold uppercase tracking-widest text-ink dark:text-gray-300">
            TREN PENDAPATAN
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Export Dropdown */}
            <div ref={exportDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-md border-2 border-ink bg-transparent px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-white dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/20 dark:hover:text-white"
              >
                <Download size={14} />
                Ekspor Data
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isExportOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isExportOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-44 origin-top-left rounded-md border border-surface-border bg-surface-dark py-1 shadow-lg sm:left-auto sm:right-0 sm:origin-top-right">
                  <button
                    type="button"
                    onClick={() => {
                      handleExportCSV();
                      setIsExportOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-gray-300 transition-colors hover:bg-primary/20 hover:text-primary"
                  >
                    <Download size={13} />
                    Unduh CSV
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => {
                      setIsExportOpen(false);
                      handleExportPDF();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-gray-300 transition-colors hover:bg-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isExporting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    {isExporting ? "Memproses..." : "Unduh Laporan PDF"}
                  </button>
                </div>
              )}
            </div>
            <div className="flex rounded-md border-2 border-ink dark:border-white/20 p-0.5">
              {(["daily", "weekly", "monthly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTimeFilter(f)}
                  className={`
                  px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-xs font-medium uppercase transition-colors
                  ${
                    timeFilter === f
                      ? "bg-primary text-primary-foreground dark:bg-[#22d3ee] dark:text-[#0a0a0a]"
                      : "text-ink dark:text-gray-400 hover:text-primary dark:hover:text-[#22d3ee]"
                  }
                `}
                >
                  {f === "daily"
                    ? "Harian"
                    : f === "weekly"
                      ? "Mingguan"
                      : "Bulanan"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          id="revenue-chart-container"
          className="w-full min-h-[300px] h-[300px] md:h-[320px]"
        >
          <SalesChart
            data={
              revenueOverTimeData.length > 0
                ? revenueOverTimeData
                : [{ name: "—", value: 0 }]
            }
            embedded
            className="h-full"
          />
        </div>
      </div>

      {/* Row 2: Top Products + Distribution */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        <div className="w-full flex">
          <TopProductsBarChart
            data={topProductsData}
            title="PRODUK TERLARIS (UNIT TERJUAL)"
            className="w-full"
          />
        </div>
        {/* Tidak ada height constraint agar legend bisa tampil penuh dan scroll */}
        <div className="w-full">
          <ProductDistributionDonut
            data={distributionData}
            title="KONTRIBUSI PENDAPATAN"
          />
        </div>
      </div>

      {/* Row 3: AI Insight */}
      <AiInsightBox
        chartData={chartDataSummary}
        timeFilter={timeFilter}
        businessName={businessName}
      />
    </div>
  );
}

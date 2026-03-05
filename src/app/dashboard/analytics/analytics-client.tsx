"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Download, ChevronDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { LOGO_BASE64 } from "@/src/lib/logo-base64";
import { SalesChart } from "@/src/components/sales-chart";
import { TopProductsBarChart } from "@/src/components/top-products-bar-chart";
import { ProductDistributionDonut } from "@/src/components/product-distribution-donut";
import { AiInsightBox } from "@/src/components/ai-insight-box";
import type { RawTransaction } from "./page";

export type TimeFilter = "daily" | "weekly" | "monthly";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Fallback raw transactions saat DB kosong */
const FALLBACK_RAW: RawTransaction[] = (() => {
  const products = ["Raja Tuna", "Kerupuk Tuna Bawang", "Sarden Premium", "Abon Tuna Pedas", "Fish Ball"];
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
  filter: TimeFilter
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
        const [y, m, day] = dateStr.split("-").map(Number);
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
      name: `Week ${i + 1}`,
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

function processTopProducts(transactions: RawTransaction[]): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(tx.productName, (byProduct.get(tx.productName) ?? 0) + tx.quantity);
  }
  return Array.from(byProduct.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function processDistribution(transactions: RawTransaction[]): { name: string; value: number }[] {
  const byProduct = new Map<string, number>();
  for (const tx of transactions) {
    byProduct.set(tx.productName, (byProduct.get(tx.productName) ?? 0) + tx.totalPrice);
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

export function AnalyticsClient({ rawTransactions, hasStore, businessName }: AnalyticsClientProps) {
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
    [filteredTransactions, timeFilter]
  );
  const topProductsData = useMemo(
    () => processTopProducts(filteredTransactions),
    [filteredTransactions]
  );
  const distributionData = useMemo(
    () => processDistribution(filteredTransactions),
    [filteredTransactions]
  );

  const chartDataSummary = useMemo(
    () => ({
      revenueOverTime: revenueOverTimeData,
      topProducts: topProductsData,
      distribution: distributionData,
    }),
    [revenueOverTimeData, topProductsData, distributionData]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportOpen]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- Computed summary values ---
      const formatRp = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;
      const totalRevenue = filteredTransactions.reduce((s, tx) => s + tx.totalPrice, 0);
      const totalAssetValue = txs.reduce((s, tx) => s + tx.totalPrice, 0);
      const totalQty = filteredTransactions.reduce((s, tx) => s + tx.quantity, 0);

      // --- HEADER BLOCK (Logo + Judul + Meta) ---
      const now = new Date();
      doc.addImage(LOGO_BASE64, "PNG", 14, 14, 15, 15);

      doc.setFontSize(16);
      doc.setTextColor(242, 13, 13);
      doc.text("LAPORAN PERFORMA BISNIS", 33, 21);

      doc.setFontSize(9);
      doc.setTextColor(117, 117, 117);
      const printDate = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
      doc.text(`Dicetak: ${printDate}`, 33, 27);
      if (businessName) {
        doc.text(`Toko: ${businessName}`, 33, 32);
      }

      // Garis merah pemisah header
      doc.setDrawColor(242, 13, 13);
      doc.setLineWidth(0.5);
      doc.line(14, 36, pageWidth - 14, 36);

      // --- SUMMARY BLOCK (Periode + Ringkasan) ---
      let currentY = 43;

      doc.setFontSize(9);
      doc.setTextColor(117, 117, 117);
      const periodLabel = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      doc.text(`Periode: ${periodLabel}`, 14, currentY);
      currentY += 6;

      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`Total Pendapatan  :  ${formatRp(totalRevenue)}`, 14, currentY);
      currentY += 6;
      doc.text(`Total Nilai Aset   :  ${formatRp(totalAssetValue)}`, 14, currentY);
      currentY += 9;

      // Garis abu-abu tipis pemisah summary → chart
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 7;

      // --- CHART SCREENSHOT ---
      const chartElement = document.getElementById("revenue-chart-container");
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 28;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 14, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 8;
      }

      // --- DATA TABLE + GRAND TOTAL ---
      const tableRows = filteredTransactions.map((tx) => [
        new Date(tx.createdAt).toLocaleDateString("id-ID"),
        tx.productName,
        tx.quantity,
        formatRp(tx.totalPrice),
      ]);

      const grandTotalRow = ["", "GRAND TOTAL", totalQty, formatRp(totalRevenue)];
      const grandTotalRowIndex = tableRows.length;

      autoTable(doc, {
        startY: currentY,
        head: [["Tanggal", "Nama Produk", "Kuantitas", "Total Pendapatan"]],
        body: [...tableRows, grandTotalRow],
        headStyles: { fillColor: [153, 27, 27], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 249, 249] },
        styles: {
          textColor: [51, 51, 51],
          lineColor: [229, 231, 235],
          lineWidth: 0.1,
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.row.index === grandTotalRowIndex) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [243, 244, 246];
            data.cell.styles.textColor = [30, 30, 30];
          }
        },
      });

      // --- FOOTER ---
      doc.setFontSize(8);
      doc.setTextColor(117, 117, 117);
      doc.text("Generated otomatis oleh Sistem ShikiPilot", 14, pageHeight - 10);

      doc.save("Laporan_Performa_ShikiPilot.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Tanggal", "Nama Produk", "Kuantitas", "Total Pendapatan (Rp)"];
    const escapeCsv = (val: string | number) => {
      const s = String(val);
      return s.includes(";") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const rows = filteredTransactions.map((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString("id-ID");
      return [escapeCsv(date), escapeCsv(tx.productName), tx.quantity, tx.totalPrice].join(";");
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
            REVENUE OVER TIME
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
                <ChevronDown size={13} className={`transition-transform duration-200 ${isExportOpen ? "rotate-180" : ""}`} />
              </button>
              {isExportOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-44 origin-top-left rounded-md border border-surface-border bg-surface-dark py-1 shadow-lg sm:left-auto sm:right-0 sm:origin-top-right">
                  <button
                    type="button"
                    onClick={() => { handleExportCSV(); setIsExportOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-gray-300 transition-colors hover:bg-primary/20 hover:text-primary"
                  >
                    <Download size={13} />
                    Unduh CSV
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => { setIsExportOpen(false); handleExportPDF(); }}
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
                  ${timeFilter === f
                    ? "bg-primary text-primary-foreground dark:bg-[#22d3ee] dark:text-[#0a0a0a]"
                    : "text-ink dark:text-gray-400 hover:text-primary dark:hover:text-[#22d3ee]"}
                `}
              >
                {f === "daily" ? "Daily" : f === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
            </div>
          </div>
        </div>
        <div id="revenue-chart-container" className="w-full min-h-[300px] h-[300px] md:h-[320px]">
          <SalesChart
            data={revenueOverTimeData.length > 0 ? revenueOverTimeData : [{ name: "—", value: 0 }]}
            embedded
            className="h-full"
          />
        </div>
      </div>

      {/* Row 2: Top Products + Distribution */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        <div className="w-full min-h-[300px] h-[300px] md:h-[320px]">
          <TopProductsBarChart
            data={topProductsData}
            title="PRODUK TERLARIS (UNIT TERJUAL)"
            className="h-full"
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

"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";
import { createBulkTransactions } from "@/src/lib/actions/transaction";
import type { POSProduct } from "./page";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type CartItem = POSProduct & { quantity: number };
type PaymentType = "cash" | "qris_statis";

interface POSClientProps {
  products: POSProduct[];
  storeId: string;
}

export function POSClient({ products, storeId }: POSClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentType>("cash");
  // Two-step confirmation: null = idle, 'cash'/'qris_statis' = armed/waiting konfirmasi
  const [confirmState, setConfirmState] = useState<PaymentType | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // SECURITY: Synchronous guard mencegah Double Submit akibat React State Batching.
  // useRef dipilih karena mutasi ref bersifat sinkronus dan tidak memicu re-render.
  const isSubmittingRef = useRef(false);

  // Cleanup timer saat komponen unmount
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cashNum = parseInt(cashReceived.replace(/\D/g, ""), 10) || 0;
  const change = Math.max(0, cashNum - grandTotal);

  const addToCart = (product: POSProduct) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      if (existing.quantity >= existing.stock) return;
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.id !== productId) return c;
          const qty = Math.max(0, Math.min(c.stock, c.quantity + delta));
          return { ...c, quantity: qty };
        })
        .filter((c) => c.quantity > 0)
    );
  };

  const setQuantityDirect = (productId: string, value: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.id !== productId) return c;
          const num = value < 0 ? 0 : Math.min(Math.floor(value), 9999);
          const qty = Math.max(0, Math.min(c.stock, num));
          return { ...c, quantity: qty };
        })
        .filter((c) => c.quantity > 0 || c.id === productId)
    );
  };

  const handleQuantityBlur = (productId: string) => {
    const item = cart.find((c) => c.id === productId);
    if (item && item.quantity <= 0) {
      updateQuantity(productId, 1);
    }
  };

  const handleSubmit = async (paymentType: PaymentType) => {
    // SECURITY GUARD: Cek ref sinkronus di baris pertama — tolak jika sudah ada proses berjalan.
    // Ini mencegah double-submit meski React belum sempat mem-batch state update.
    if (isSubmittingRef.current) return;

    if (cart.length === 0) {
      toast.error("Keranjang kosong", { description: "Tambah produk terlebih dahulu." });
      return;
    }
    if (grandTotal === 0) {
      toast.error("Total tidak valid");
      return;
    }

    // CASH: validasi uang diterima >= grandTotal
    if (paymentType === "cash" && cashNum < grandTotal) {
      toast.error("Uang kurang", {
        description: `Uang diterima Rp ${cashNum.toLocaleString("id-ID")} kurang dari total Rp ${grandTotal.toLocaleString("id-ID")}.`,
      });
      return;
    }

    // QRIS: bypass validasi — jumlah selalu = grandTotal (kembalian 0)
    const effectiveCash = paymentType === "qris_statis" ? grandTotal : cashNum;

    // Kunci sinkronus SEBELUM operasi async apapun dimulai
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const items = cart
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          paymentType,
        }));

      // Kirim effectiveCash sebagai uang_diterima ke DB
      const result = await createBulkTransactions(storeId, items, effectiveCash);

      if (result.success) {
        const methodLabel = paymentType === "cash" ? "Cash" : "QRIS";
        toast.success("Transaksi berhasil disimpan", {
          description: `${result.count} item dicatat via ${methodLabel}.`,
        });
        setCart([]);
        setCashReceived("");
      } else {
        toast.error("Gagal menyimpan", { description: result.error });
      }
    } catch {
      toast.error("Gagal menyimpan", { description: "Terjadi kesalahan." });
    } finally {
      // Lepas kedua kunci — ref sinkronus dan state UI
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  /**
   * handleConfirmClick — Two-Step Confirmation (tanpa modal)
   * Klik 1 (Arm)  : Set confirmState → visual berubah kuning, timer 3 detik untuk auto-reset.
   * Klik 2 (Fire) : Batalkan timer → eksekusi submit asli.
   */
  const handleConfirmClick = (paymentType: PaymentType) => {
    if (confirmState === paymentType) {
      // ── KLIK KEDUA: Eksekusi ──
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmState(null);

      // Logika QRIS: inject grandTotal ke display & bypass validasi input
      if (paymentType === "qris_statis") {
        setActivePayment("qris_statis");
        setCashReceived(grandTotal > 0 ? grandTotal.toLocaleString("id-ID") : "");
      } else {
        setActivePayment("cash");
      }
      handleSubmit(paymentType);
    } else {
      // ── KLIK PERTAMA: Arm (aktifkan mode konfirmasi) ──
      // Batalkan timer sebelumnya jika ada (beralih metode)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmState(paymentType);

      // Preview input field untuk QRIS saat armed
      if (paymentType === "qris_statis" && grandTotal > 0) {
        setCashReceived(grandTotal.toLocaleString("id-ID"));
      }

      // Auto-reset setelah 3 detik jika tidak ada konfirmasi
      confirmTimerRef.current = setTimeout(() => {
        setConfirmState(null);
        // Bersihkan preview QRIS jika tidak jadi dikonfirmasi
        if (paymentType === "qris_statis" && activePayment !== "qris_statis") {
          setCashReceived("");
        }
      }, 3000);
    }
  };

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip semua non-digit, lalu format ulang dengan titik ribuan (id-ID)
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setCashReceived("");
    } else {
      setCashReceived(Number(raw).toLocaleString("id-ID"));
    }
  };

  // Label kembalian — untuk QRIS selalu Rp 0 (exact match)
  const differenceLabel = activePayment === "cash" ? "Kembalian" : "Kembalian";

  return (
    <div className="flex flex-col">
      {/* Area Katalog & Keranjang - native scroll */}
      <div className="flex flex-col p-4 md:p-6 gap-6">
        {/* Katalog Produk */}
        <div className="shrink-0 border-b-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] pb-4">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-gray-300">
            KATALOG PRODUK
          </p>
          {products.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 font-mono text-sm bg-transparent border-b-2 border-ink/50 dark:border-white/30 text-ink dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-primary dark:focus:border-[#22d3ee]"
              />
            </div>
          )}
          {products.length === 0 ? (
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
              Belum ada produk. Tambah produk di Inventory.
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
              Tidak ada hasil untuk &quot;{searchQuery}&quot;
            </p>
          ) : (
            <div className="flex flex-row overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className="min-w-[160px] max-w-[200px] flex-shrink-0 snap-center flex flex-col items-stretch gap-1 rounded-lg border-2 border-ink bg-white p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 dark:border-white/20 dark:bg-white/5 dark:hover:border-[#22d3ee] dark:hover:bg-[#22d3ee]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate font-mono text-xs font-medium text-ink dark:text-white">
                    {p.name}
                  </span>
                  <span className="font-mono text-lg font-bold text-primary dark:text-[#22d3ee]">
                    {formatRupiah(p.price)}
                  </span>
                  <span className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      Stok: {p.stock}
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-primary dark:text-[#22d3ee]" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keranjang */}
        <div className="flex flex-col">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-ink dark:text-gray-300">
            KERANJANG
          </p>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/30 dark:border-white/20 py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 font-mono text-sm text-gray-500 dark:text-gray-400">
              Keranjang kosong. Tap produk untuk menambah.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-medium text-ink dark:text-white">
                    {item.name}
                  </p>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {formatRupiah(item.price)} × {item.quantity} ={" "}
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded border-2 border-ink dark:border-white/20 text-ink dark:text-white hover:bg-ink hover:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        setQuantityDirect(item.id, 0);
                      } else {
                        const num = parseInt(v, 10);
                        if (!Number.isNaN(num)) setQuantityDirect(item.id, num);
                      }
                    }}
                    onBlur={() => handleQuantityBlur(item.id)}
                    className="w-12 text-center font-mono text-sm font-bold tabular-nums bg-transparent border-b border-ink/30 dark:border-white/30 text-ink dark:text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.quantity >= item.stock}
                    className="flex h-9 w-9 items-center justify-center rounded border-2 border-ink dark:border-white/20 text-ink dark:text-white hover:bg-ink hover:text-white dark:hover:bg-white/20 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Panel Kalkulator - mengikuti scroll alami halaman */}
      <div className="border-t-2 border-ink dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-4">
        <div className="space-y-3">
          {/* Grand Total */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm uppercase tracking-wider text-ink dark:text-gray-300">
              Grand Total
            </span>
            <span className="font-mono text-2xl font-black tabular-nums text-primary dark:text-[#22d3ee]">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          {/* Input Uang Diterima — aktif untuk semua metode */}
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {activePayment === "cash" ? "Uang Diterima" : "Nominal Transfer"}
            </label>
            <div className="flex rounded-lg border-2 border-ink dark:border-white/20 bg-white dark:bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-[#22d3ee]">
              <span className="flex items-center px-3 font-mono text-lg text-gray-500 dark:text-gray-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={cashReceived}
                onChange={handleCashInput}
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent px-2 py-3 font-mono text-lg font-bold tabular-nums text-ink dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Kembalian */}
          <div className="flex items-center justify-between rounded-lg border-2 border-ink/50 dark:border-white/20 bg-gray-50 dark:bg-white/5 px-4 py-2 transition-colors">
            <span className="font-mono text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
              {differenceLabel}
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-ink dark:text-white">
              {activePayment === "qris_statis" ? formatRupiah(0) : formatRupiah(change)}
            </span>
          </div>

          {/* Tombol Pembayaran — 2 tombol berdampingan (Two-Step Confirmation) */}
          <div className="grid grid-cols-2 gap-3 pt-1">

            {/* CASH */}
            {(() => {
              const isArmed = confirmState === "cash";
              const isSubmittingThis = isSubmitting && activePayment === "cash";
              return (
                <button
                  type="button"
                  onClick={() => handleConfirmClick("cash")}
                  disabled={cart.length === 0 || isSubmitting}
                  className={[
                    "relative overflow-hidden flex items-center justify-center gap-2 rounded-lg border-2 py-4 font-mono text-base font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    isArmed
                      ? "border-amber-500 bg-amber-500 text-white scale-[1.02] shadow-lg shadow-amber-500/30 dark:border-amber-400 dark:bg-amber-400 dark:text-[#0a0a0a]"
                      : "border-ink bg-ink text-white hover:bg-ink/80 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
                  ].join(" ")}
                >
                  {/* Fill Meter: inline style agar tidak bergantung Tailwind JIT */}
                  <div
                    className="absolute top-0 left-0 h-full bg-yellow-300/60 dark:bg-yellow-200/40"
                    style={{
                      width: isArmed ? "100%" : "0%",
                      transition: isArmed
                        ? "width 3000ms linear"
                        : "none",
                    }}
                  />
                  <span className="relative z-10">
                    {isSubmittingThis
                      ? "⏳ Menyimpan..."
                      : isArmed
                      ? "✅ Konfirmasi CASH?"
                      : "💵 CASH"}
                  </span>
                </button>
              );
            })()}

            {/* QRIS — 1-klik preview, 2-klik eksekusi */}
            {(() => {
              const isArmed = confirmState === "qris_statis";
              const isSubmittingThis = isSubmitting && activePayment === "qris_statis";
              return (
                <button
                  type="button"
                  onClick={() => handleConfirmClick("qris_statis")}
                  onMouseEnter={() => {
                    if (!confirmState && grandTotal > 0)
                      setCashReceived(grandTotal.toLocaleString("id-ID"));
                  }}
                  onMouseLeave={() => {
                    if (!confirmState && activePayment !== "qris_statis")
                      setCashReceived("");
                  }}
                  disabled={cart.length === 0 || isSubmitting}
                  className={[
                    "relative overflow-hidden flex items-center justify-center gap-2 rounded-lg border-2 py-4 font-mono text-base font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    isArmed
                      ? "border-amber-500 bg-amber-500 text-white scale-[1.02] shadow-lg shadow-amber-500/30 dark:border-amber-400 dark:bg-amber-400 dark:text-[#0a0a0a]"
                      : "border-primary bg-primary text-white hover:bg-primary/90 dark:border-[#22d3ee] dark:bg-[#22d3ee] dark:text-[#0a0a0a] dark:hover:bg-[#22d3ee]/90",
                  ].join(" ")}
                >
                  {/* Fill Meter: inline style agar tidak bergantung Tailwind JIT */}
                  <div
                    className="absolute top-0 left-0 h-full bg-yellow-300/60 dark:bg-yellow-200/40"
                    style={{
                      width: isArmed ? "100%" : "0%",
                      transition: isArmed
                        ? "width 3000ms linear"
                        : "none",
                    }}
                  />
                  <span className="relative z-10">
                    {isSubmittingThis
                      ? "⏳ Menyimpan..."
                      : isArmed
                      ? "✅ Konfirmasi QRIS?"
                      : "📱 QRIS"}
                  </span>
                </button>
              );
            })()}
          </div>

          {/* Hint saat tombol armed */}
          {confirmState !== null && !isSubmitting && (
            <p className="text-center font-mono text-xs text-amber-500 dark:text-amber-400">
              ⚡ Klik sekali lagi untuk konfirmasi, atau tunggu 3 detik untuk batal.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

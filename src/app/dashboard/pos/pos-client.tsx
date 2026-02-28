"use client";

import { useState } from "react";
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

interface POSClientProps {
  products: POSProduct[];
  storeId: string;
}

export function POSClient({ products, storeId }: POSClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.id !== productId));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong", { description: "Tambah produk terlebih dahulu." });
      return;
    }
    if (grandTotal === 0) {
      toast.error("Total tidak valid");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = cart
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        }));

      const result = await createBulkTransactions(storeId, items);

      if (result.success) {
        toast.success("Transaksi berhasil disimpan", {
          description: `${result.count} item telah dicatat.`,
        });
        setCart([]);
        setCashReceived("");
      } else {
        toast.error("Gagal menyimpan", { description: result.error });
      }
    } catch {
      toast.error("Gagal menyimpan", { description: "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCashReceived(raw);
  };

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
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm uppercase tracking-wider text-ink dark:text-gray-300">
              Grand Total
            </span>
            <span className="font-mono text-2xl font-black tabular-nums text-primary dark:text-[#22d3ee]">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Uang Diterima
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

          <div className="flex items-center justify-between rounded-lg border-2 border-ink/50 dark:border-white/20 bg-gray-50 dark:bg-white/5 px-4 py-2">
            <span className="font-mono text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Kembalian
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-ink dark:text-white">
              {formatRupiah(change)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full rounded-lg border-2 border-primary bg-primary py-4 font-mono text-lg font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#22d3ee] dark:bg-[#22d3ee] dark:text-[#0a0a0a] dark:hover:bg-[#22d3ee]/90"
          >
            {isSubmitting ? "Menyimpan..." : "SIMPAN TRANSAKSI"}
          </button>
        </div>
      </div>
    </div>
  );
}

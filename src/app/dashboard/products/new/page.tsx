'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  createProduct,
  type CreateProductState,
} from '@/src/lib/actions/product';
import { DashboardHeader } from '@/src/components/dashboard-header';

const initialState: CreateProductState = {};

const inputClass =
  'w-full rounded-md border border-border bg-secondary/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const labelClass = 'block font-mono text-sm text-muted-foreground mb-1.5';

export default function NewProductPage() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL / INVENTORY / NEW ENTRY"
          title="REGISTER NEW ASSET"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-mono text-lg font-semibold text-foreground">
                Tambah Produk Baru
              </h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                Deskripsi produk akan diproses dengan AI untuk pencarian semantik.
              </p>
            </div>

            <form action={formAction} className="space-y-5 p-6">
              {state?.error && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 font-mono text-sm text-destructive"
                >
                  {state.error}
                </div>
              )}

              <div>
                <label htmlFor="name" className={labelClass}>
                  Nama Produk <span className="text-primary">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Kaos Polos Cotton Combed"
                  className={inputClass}
                  aria-invalid={!!state?.fieldErrors?.name}
                  aria-describedby={
                    state?.fieldErrors?.name ? 'name-error' : undefined
                  }
                />
                {state?.fieldErrors?.name && (
                  <p id="name-error" className="mt-1.5 font-mono text-sm text-destructive">
                    {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Gambar Produk <span className="text-muted-foreground/80">(opsional)</span>
                </label>
                <div className="mt-1.5">
                  <label
                    htmlFor="image"
                    className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-border hover:bg-secondary/50"
                  >
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                      aria-invalid={!!state?.fieldErrors?.image}
                      aria-describedby={
                        state?.fieldErrors?.image ? 'image-error' : undefined
                      }
                    />
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
                        <svg
                          className="h-10 w-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                        <span className="font-mono text-sm">Klik untuk pilih gambar (max 2MB)</span>
                      </div>
                    )}
                  </label>
                  {state?.fieldErrors?.image && (
                    <p id="image-error" className="mt-1.5 font-mono text-sm text-destructive">
                      {state.fieldErrors.image[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className={labelClass}>
                    Harga (Rp) <span className="text-primary">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step={1}
                    required
                    placeholder="0"
                    className={inputClass}
                    aria-invalid={!!state?.fieldErrors?.price}
                    aria-describedby={
                      state?.fieldErrors?.price ? 'price-error' : undefined
                    }
                  />
                  {state?.fieldErrors?.price && (
                    <p id="price-error" className="mt-1.5 font-mono text-sm text-destructive">
                      {state.fieldErrors.price[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="stock" className={labelClass}>
                    Stok <span className="text-primary">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min={0}
                    step={1}
                    required
                    placeholder="0"
                    className={inputClass}
                    aria-invalid={!!state?.fieldErrors?.stock}
                    aria-describedby={
                      state?.fieldErrors?.stock ? 'stock-error' : undefined
                    }
                  />
                  {state?.fieldErrors?.stock && (
                    <p id="stock-error" className="mt-1.5 font-mono text-sm text-destructive">
                      {state.fieldErrors.stock[0]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Deskripsi <span className="text-primary">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Deskripsi produk untuk AI embedding (bahan, ukuran, kegunaan, dll.)"
                  className={`${inputClass} resize-none`}
                  aria-invalid={!!state?.fieldErrors?.description}
                  aria-describedby={
                    state?.fieldErrors?.description
                      ? 'description-error'
                      : undefined
                  }
                />
                {state?.fieldErrors?.description && (
                  <p
                    id="description-error"
                    className="mt-1.5 font-mono text-sm text-destructive"
                  >
                    {state.fieldErrors.description[0]}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-center font-mono text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
                >
                  {isPending
                    ? 'Sedang menyimpan & memproses AI...'
                    : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

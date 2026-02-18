'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  createProduct,
  type CreateProductState,
} from '../../../../lib/actions/product';

const initialState: CreateProductState = {};

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-xl text-gray-800">ShikiPilot</span>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto py-10 px-6">
        <div className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">
              Tambah Produk Baru
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Deskripsi produk akan diproses dengan AI untuk pencarian semantik.
            </p>
          </div>

          <form action={formAction} className="p-6 space-y-5">
            {state?.error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800"
              >
                {state.error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                placeholder="Contoh: Kaos Polos Cotton Combed"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                aria-invalid={!!state?.fieldErrors?.name}
                aria-describedby={
                  state?.fieldErrors?.name ? 'name-error' : undefined
                }
              />
              {state?.fieldErrors?.name && (
                <p id="name-error" className="mt-1.5 text-sm text-red-600">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gambar Produk <span className="text-gray-400">(opsional)</span>
              </label>
              <div className="mt-1 flex flex-col items-start gap-2">
                <label
                  htmlFor="image"
                  className="relative flex flex-col items-center justify-center w-full min-h-[140px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100/50 transition-colors cursor-pointer"
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
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-500 py-6">
                      <svg
                        className="w-10 h-10"
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
                      <span className="text-sm">Klik untuk pilih gambar (max 2MB)</span>
                    </div>
                  )}
                </label>
                {state?.fieldErrors?.image && (
                  <p id="image-error" className="text-sm text-red-600">
                    {state.fieldErrors.image[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step={1}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-invalid={!!state?.fieldErrors?.price}
                  aria-describedby={
                    state?.fieldErrors?.price ? 'price-error' : undefined
                  }
                />
                {state?.fieldErrors?.price && (
                  <p id="price-error" className="mt-1.5 text-sm text-red-600">
                    {state.fieldErrors.price[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-invalid={!!state?.fieldErrors?.stock}
                  aria-describedby={
                    state?.fieldErrors?.stock ? 'stock-error' : undefined
                  }
                />
                {state?.fieldErrors?.stock && (
                  <p id="stock-error" className="mt-1.5 text-sm text-red-600">
                    {state.fieldErrors.stock[0]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                placeholder="Deskripsi produk untuk AI embedding (bahan, ukuran, kegunaan, dll.)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
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
                  className="mt-1.5 text-sm text-red-600"
                >
                  {state.fieldErrors.description[0]}
                </p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href="/dashboard"
                className="flex-1 inline-flex justify-center items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none transition-colors"
              >
                {isPending
                  ? 'Sedang menyimpan & memproses AI...'
                  : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

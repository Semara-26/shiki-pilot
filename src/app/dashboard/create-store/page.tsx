'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createStore, type CreateStoreState } from '@/src/lib/actions/store';

const initialState: CreateStoreState = {};

export default function CreateStorePage() {
  const [state, formAction, isPending] = useActionState(createStore, initialState);

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
              Buat Toko Pertama
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Isi nama dan deskripsi toko. Slug akan dibuat otomatis dari nama.
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
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                placeholder="Contoh: Toko Serba Ada"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                aria-invalid={!!state?.fieldErrors?.name}
                aria-describedby={state?.fieldErrors?.name ? 'name-error' : undefined}
              />
              {state?.fieldErrors?.name && (
                <p id="name-error" className="mt-1.5 text-sm text-red-600">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Deskripsi <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Deskripsi singkat tentang toko Anda"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
                aria-invalid={!!state?.fieldErrors?.description}
                aria-describedby={state?.fieldErrors?.description ? 'description-error' : undefined}
              />
              {state?.fieldErrors?.description && (
                <p id="description-error" className="mt-1.5 text-sm text-red-600">
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
                {isPending ? 'Sedang membuat...' : 'Buat Toko'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

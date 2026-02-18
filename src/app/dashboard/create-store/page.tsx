'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createStore, type CreateStoreState } from '@/src/lib/actions/store';
import { DashboardHeader } from '@/src/components/dashboard-header';

const initialState: CreateStoreState = {};

const inputClass =
  'w-full rounded-md border border-border bg-secondary/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';

const labelClass = 'block font-mono text-sm text-muted-foreground mb-1.5';

export default function CreateStorePage() {
  const [state, formAction, isPending] = useActionState(
    createStore,
    initialState
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL"
          title="INITIALIZE STORE // SETUP"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-mono text-lg font-semibold text-foreground">
                Buat Toko Pertama
              </h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                Isi nama dan deskripsi toko. Slug akan dibuat otomatis dari nama.
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
                  Nama Toko <span className="text-primary">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Toko Serba Ada"
                  className={inputClass}
                  aria-invalid={!!state?.fieldErrors?.name}
                  aria-describedby={
                    state?.fieldErrors?.name ? 'name-error' : undefined
                  }
                />
                {state?.fieldErrors?.name && (
                  <p
                    id="name-error"
                    className="mt-1.5 font-mono text-sm text-destructive"
                  >
                    {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Deskripsi <span className="text-muted-foreground/80">(opsional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Deskripsi singkat tentang toko Anda"
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
                  {isPending ? 'Sedang membuat...' : 'Buat Toko'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

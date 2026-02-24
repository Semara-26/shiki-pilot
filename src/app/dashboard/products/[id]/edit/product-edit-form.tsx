'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  updateProduct,
  type CreateProductState,
} from '@/src/lib/actions/product';

const initialState: CreateProductState = {};

const inputClass =
  'w-full rounded-md border border-border bg-secondary/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const labelClass = 'block font-mono text-sm text-muted-foreground mb-1.5';

export interface ProductEditInitialData {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string | null;
}

interface ProductEditFormProps {
  initialData: ProductEditInitialData;
}

export function ProductEditForm({ initialData }: ProductEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.imageUrl
  );

  useEffect(() => {
    if (state?.error) {
      toast.error('Gagal menyimpan', { description: state.error });
    }
  }, [state?.error]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(initialData.imageUrl);
    }
  };

  return (
    <form action={formAction} className="space-y-5 p-6">
      <input type="hidden" name="id" value={initialData.id} />
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
          defaultValue={initialData.name}
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
            defaultValue={initialData.price}
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
            defaultValue={initialData.stock}
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
          defaultValue={initialData.description}
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
          href="/dashboard/inventory"
          className="flex-1 rounded-md border border-border bg-secondary/50 px-4 py-2.5 text-center font-mono text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-primary px-4 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? 'MENYIMPAN...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}

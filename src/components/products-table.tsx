"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

export interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProductsTableProps {
  products: ProductRow[];
  className?: string;
}

export function ProductsTable({ products, className }: ProductsTableProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card text-card-foreground overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="crisp-table border-b border-border/60 bg-muted/30">
              <th className="px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                ID
              </th>
              <th className="px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                Product Name
              </th>
              <th className="w-[120px] px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                Status
              </th>
              <th className="w-[72px] px-4 py-4 text-left font-medium uppercase tracking-widest text-muted-foreground">
                Resource
              </th>
              <th className="px-4 py-4 text-right font-medium uppercase tracking-widest text-muted-foreground">
                Price
              </th>
              <th className="px-4 py-4 text-right font-medium uppercase tracking-widest text-muted-foreground">
                Stock
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="crisp-table transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-4 font-medium text-foreground">
                    #{product.id.substring(0, 4)}
                  </td>
                  <td className="px-4 py-4 text-foreground">{product.name}</td>
                  <td className="w-[120px] px-4 py-4 align-middle">
                    <span
                      className={cn(
                        "inline-block rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider",
                        product.stock > 0
                          ? "bg-chart-2/20 text-chart-2"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {product.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"}
                    </span>
                  </td>
                  <td className="w-[72px] px-4 py-4 align-middle">
                    {product.imageUrl ? (
                      <div className="relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground avatar-mono">
                        {getInitials(product.name)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-foreground">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-foreground">
                    {product.stock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

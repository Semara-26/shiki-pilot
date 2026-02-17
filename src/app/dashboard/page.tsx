import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { stores } from "../../db/schema";
import { products } from "../../db/schema";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
      })
    : null;

  const storeProducts =
    userStore?.id != null
      ? await db.query.products.findMany({
          where: eq(products.storeId, userStore.id),
          columns: { id: true, name: true, price: true, stock: true, embedding: true },
        })
      : [];
  const totalProducts = storeProducts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl text-gray-800">ShikiPilot</span>
        </div>
        <UserButton />
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-6">
        {!userStore ? (
          /* KONDISI A: Belum punya toko — Welcome & Create Store */
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Selamat Datang di Cockpit!
            </h1>
            <p className="text-gray-600 mb-6">
              Anda berhasil menembus sistem keamanan.
              <br />
              Langkah selanjutnya: Buat toko pertama Anda untuk mulai mengelola
              produk dan chat.
            </p>
            <Link
              href="/dashboard/create-store"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              + Buat Toko Pertama
            </Link>
          </div>
        ) : (
          /* KONDISI B: Sudah punya toko — Dashboard Toko */
          <div className="space-y-8">
            {/* Header: Nama Toko & Slug */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userStore.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  /{userStore.slug}
                </p>
              </div>
            </header>

            {/* Stats Cards — Grid 3 kolom */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Total Produk
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalProducts}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Total Chat
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  Rp 0
                </p>
              </div>
            </section>

            {/* Action: Tambah Produk Baru */}
            <div>
              <Link
                href="/dashboard/products/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
              >
                + Tambah Produk Baru
              </Link>
            </div>

            {/* Product List — Grid Card */}
            <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {storeProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Belum ada produk yang diupload
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {storeProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          {product.embedding != null &&
                          (Array.isArray(product.embedding)
                            ? product.embedding.length > 0
                            : true) ? (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              AI Ready
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {formatRupiah(product.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stok: {product.stock}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

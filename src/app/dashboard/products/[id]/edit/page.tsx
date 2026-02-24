import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/src/db';
import { stores, products } from '@/src/db/schema';
import { DashboardHeader } from '@/src/components/dashboard-header';
import { PageContainer } from '@/src/components/page-animation';
import { ProductEditForm } from './product-edit-form';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
        columns: { id: true },
      })
    : null;

  if (!userStore) {
    notFound();
  }

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.storeId, userStore.id)),
    columns: {
      id: true,
      name: true,
      price: true,
      stock: true,
      description: true,
      imageUrl: true,
    },
  });

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description,
    imageUrl: product.imageUrl,
  };

  return (
    <PageContainer className="h-full w-full">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-none">
          <DashboardHeader
            breadcrumbs="TERMINAL / INVENTORY / EDIT ASSET"
            title="EDIT ASSET"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-xl">
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <h2 className="font-mono text-lg font-semibold text-foreground">
                  Edit Produk
                </h2>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  Deskripsi produk akan diproses dengan AI untuk pencarian semantik.
                </p>
              </div>
              <ProductEditForm initialData={initialData} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

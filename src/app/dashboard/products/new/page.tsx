import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { stores } from "@/src/db/schema";
import { DashboardHeaderServer } from "@/src/components/dashboard-header-server";
import NewProductForm from "./new-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { userId } = await auth();
  const userStore = userId
    ? await db.query.stores.findFirst({
        where: eq(stores.userId, userId),
        columns: { id: true },
      })
    : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none">
        <DashboardHeaderServer
          storeId={userStore?.id}
          title="TAMBAH PRODUK"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl">
          <NewProductForm />
        </div>
      </div>
    </div>
  );
}

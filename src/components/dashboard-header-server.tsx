import { DashboardHeader, type DashboardHeaderProduct } from "./dashboard-header";
import { getAllProductsForChart } from "@/src/lib/dashboard-data";

export interface DashboardHeaderServerProps {
  storeId?: string;
  title?: string;
  hideBell?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export async function DashboardHeaderServer({
  storeId,
  hideBell,
  ...props
}: DashboardHeaderServerProps) {
  if (!storeId || hideBell) {
    return <DashboardHeader hideBell={hideBell} {...props} />;
  }

  const products = await getAllProductsForChart(storeId);
  const headerProducts: DashboardHeaderProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    stockCritical: p.stockCritical,
  }));

  return (
    <DashboardHeader
      hideBell={hideBell}
      products={headerProducts}
      {...props}
    />
  );
}

import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  resourceImg?: string;
  price: number;
  stock: number;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "raja-tuna-001",
    name: "Raja Tuna",
    status: "ACTIVE",
    price: 15000,
    stock: 100,
  },
  {
    id: "raja-tuna-002",
    name: "Kerupuk Tuna Rasa Bawang",
    status: "ACTIVE",
    price: 12000,
    stock: 50,
  },
  {
    id: "raja-tuna-003",
    name: "Kerupuk Tuna Pedas",
    status: "ACTIVE",
    price: 12000,
    stock: 75,
  },
];

interface InventoryState {
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: INITIAL_PRODUCTS,
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));

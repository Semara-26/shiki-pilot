import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  vector,
  index,
} from "drizzle-orm/pg-core";

// 1. Tabel Stores (Toko)
export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // ID dari Clerk nanti
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  businessType: text("business_type"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number").notNull().default("-").unique(),
  address: text("address").notNull().default("-"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Tabel Products (Knowledge Base + Vector)
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    stock: integer("stock").notNull(),
    stockWarning: integer("stock_warning").notNull().default(10),
    stockCritical: integer("stock_critical").notNull().default(5),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    // Vector Embedding (768 dimensi adalah standar model OpenAI/Google)
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Index biar query cepet
    storeIdx: index("product_store_idx").on(table.storeId),
    // Index khusus vector search (HNSW) - Optional tapi Pro
    embeddingIndex: index("embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);

// 3. Tabel Chats (Sesi)
export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .references(() => stores.id, { onDelete: "cascade" })
    .notNull(),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Tabel Messages (Isi Chat)
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Tabel Event Logs (untuk Dashboard: Create/Update/Delete produk)
export const eventLogs = pgTable("event_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .references(() => stores.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Tabel Transactions (Header)
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    receiptId: text("receipt_id").notNull().unique(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    totalPrice: integer("total_price").notNull(),
    type: text("type").notNull().default("out"),
    paymentType: text("payment_type", { enum: ["cash", "qris_statis"] })
      .notNull()
      .default("cash"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    storeIdx: index("transaction_store_idx").on(table.storeId),
  }),
);

// 7. Tabel Transaction Items (Detail)
export const transactionItems = pgTable(
  "transaction_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transaction_id")
      .references(() => transactions.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: integer("subtotal").notNull(),
  },
  (table) => ({
    transactionIdx: index("item_transaction_idx").on(table.transactionId),
    productIdx: index("item_product_idx").on(table.productId),
  }),
);

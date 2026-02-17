import { pgTable, uuid, text, integer, timestamp, vector, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Tabel Stores (Toko)
export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // ID dari Clerk nanti
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabel Products (Knowledge Base + Vector)
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  stock: integer('stock').notNull(),
  description: text('description').notNull(),
  // Vector Embedding (768 dimensi adalah standar model OpenAI/Google)
  embedding: vector('embedding', { dimensions: 768 }), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    // Index biar query cepet
    storeIdx: index('product_store_idx').on(table.storeId),
    // Index khusus vector search (HNSW) - Optional tapi Pro
    embeddingIndex: index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));

// 3. Tabel Chats (Sesi)
export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id, { onDelete: 'cascade' }).notNull(),
  customerName: text('customer_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabel Messages (Isi Chat)
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id').references(() => chats.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
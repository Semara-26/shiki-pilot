import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/src/db';
import { stores } from '@/src/db/schema';
import { CreateStoreClient } from './create-store-client';

export default async function CreateStorePage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const existingStore = await db.query.stores.findFirst({
    where: eq(stores.userId, userId),
    columns: { id: true },
  });

  if (existingStore) {
    redirect('/dashboard');
  }

  return <CreateStoreClient />;
}

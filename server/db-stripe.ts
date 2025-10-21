import { eq } from "drizzle-orm";
import { stripeCustomers, InsertStripeCustomer } from "../drizzle/schema";
import { getDb } from "./db";

export async function createStripeCustomer(customer: InsertStripeCustomer): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(stripeCustomers).values(customer).onDuplicateKeyUpdate({
    set: { stripeCustomerId: customer.stripeCustomerId },
  });
}

export async function getStripeCustomer(userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, userId)).limit(1);
  return result[0] || null;
}

export async function getStripeCustomerByStripeId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0] || null;
}


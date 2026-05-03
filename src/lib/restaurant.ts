import { db, restaurantsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function getRestaurantFromSubdomain(subdomain: string | null | undefined) {
  const sub = subdomain || process.env.RESTAURANT_SUBDOMAIN;

  if (sub) {
    const [restaurant] = await db
      .select()
      .from(restaurantsTable)
      .where(eq(restaurantsTable.subdomain, sub));
    return restaurant ?? null;
  }

  // Last resort for local dev without env var: use first restaurant
  const [first] = await db.select().from(restaurantsTable).limit(1);
  return first ?? null;
}

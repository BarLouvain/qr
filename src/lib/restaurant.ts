import { db, restaurantsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function getRestaurantFromSubdomain(subdomain: string | null | undefined) {
  try {
    const sub = subdomain || process.env.RESTAURANT_SUBDOMAIN;

    if (sub) {
      const [restaurant] = await db
        .select()
        .from(restaurantsTable)
        .where(eq(restaurantsTable.subdomain, sub));
      return restaurant ?? null;
    }

    const [first] = await db.select().from(restaurantsTable).limit(1);
    return first ?? null;
  } catch (err: any) {
    console.error("[getRestaurantFromSubdomain] DB error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return null;
  }
}

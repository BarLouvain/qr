import { NextRequest, NextResponse } from "next/server";
import { db, menuTagsTable } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { getRestaurantId, unauthorizedResponse } from "@/lib/auth";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";
import { z } from "zod";

const CreateTagBody = z.object({
  value: z.string().min(1).regex(/^[a-z0-9_-]+$/, "Alleen kleine letters, cijfers, - en _"),
  label: z.string().min(1),
  icon: z.string().default(""),
  bgColor: z.string().default("#f0f0f0"),
  textColor: z.string().default("#555555"),
  borderColor: z.string().default("#dddddd"),
  sortOrder: z.number().optional(),
});

// Public: get tags by subdomain (for menu display)
export async function GET(req: NextRequest) {
  const subdomain = req.headers.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);
  if (!restaurant) return NextResponse.json([]);

  const tags = await db
    .select()
    .from(menuTagsTable)
    .where(eq(menuTagsTable.restaurantId, restaurant.id))
    .orderBy(asc(menuTagsTable.sortOrder));

  return NextResponse.json(tags);
}

// Admin: create tag
export async function POST(req: NextRequest) {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) return unauthorizedResponse();

  const body = await req.json();
  const parsed = CreateTagBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [tag] = await db
    .insert(menuTagsTable)
    .values({ ...parsed.data, restaurantId, sortOrder: parsed.data.sortOrder ?? 0 })
    .returning();

  return NextResponse.json(tag, { status: 201 });
}

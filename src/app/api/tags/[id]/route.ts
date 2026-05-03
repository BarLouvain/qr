import { NextRequest, NextResponse } from "next/server";
import { db, menuTagsTable } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getRestaurantId, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const UpdateTagBody = z.object({
  value: z.string().min(1).regex(/^[a-z0-9_-]+$/).optional(),
  label: z.string().min(1).optional(),
  icon: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateTagBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [tag] = await db
    .update(menuTagsTable)
    .set(parsed.data)
    .where(and(eq(menuTagsTable.id, Number(id)), eq(menuTagsTable.restaurantId, restaurantId)))
    .returning();

  if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  return NextResponse.json(tag);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const restaurantId = getRestaurantId(req);
  if (!restaurantId) return unauthorizedResponse();

  const { id } = await params;
  const [tag] = await db
    .delete(menuTagsTable)
    .where(and(eq(menuTagsTable.id, Number(id)), eq(menuTagsTable.restaurantId, restaurantId)))
    .returning();

  if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { db, menuItemsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const UpdateItemBody = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredBadge: z.string().nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, Number(id)));

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateItemBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [item] = await db
    .update(menuItemsTable)
    .set(parsed.data)
    .where(eq(menuItemsTable.id, Number(id)))
    .returning();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const [item] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, Number(id)))
    .returning();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}

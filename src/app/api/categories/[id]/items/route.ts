import { NextRequest, NextResponse } from "next/server";
import { db, menuItemsTable } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const CreateItemBody = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.string().min(1),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  featuredBadge: z.string().nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.categoryId, Number(id)))
    .orderBy(asc(menuItemsTable.sortOrder));
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = CreateItemBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [item] = await db
    .insert(menuItemsTable)
    .values({
      ...parsed.data,
      categoryId: Number(id),
      tags: parsed.data.tags ?? [],
      featured: parsed.data.featured ?? false,
      active: parsed.data.active ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}

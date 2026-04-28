import { NextRequest, NextResponse } from "next/server";
import { db, menuCategoriesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const UpdateCategoryBody = z.object({
  label: z.string().min(1).optional(),
  note: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [category] = await db
    .select()
    .from(menuCategoriesTable)
    .where(eq(menuCategoriesTable.id, Number(id)));

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateCategoryBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [category] = await db
    .update(menuCategoriesTable)
    .set(parsed.data)
    .where(eq(menuCategoriesTable.id, Number(id)))
    .returning();

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const [category] = await db
    .delete(menuCategoriesTable)
    .where(eq(menuCategoriesTable.id, Number(id)))
    .returning();

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { db, menuCategoriesTable } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const CreateCategoryBody = z.object({
  label: z.string().min(1),
  note: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const categories = await db
    .select()
    .from(menuCategoriesTable)
    .where(eq(menuCategoriesTable.sectionId, Number(id)))
    .orderBy(asc(menuCategoriesTable.sortOrder));
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = CreateCategoryBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [category] = await db
    .insert(menuCategoriesTable)
    .values({
      ...parsed.data,
      sectionId: Number(id),
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json(category, { status: 201 });
}

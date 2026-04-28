import { NextRequest, NextResponse } from "next/server";
import { db, menuSectionsTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const UpdateSectionBody = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [section] = await db
    .select()
    .from(menuSectionsTable)
    .where(eq(menuSectionsTable.id, Number(id)));

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  return NextResponse.json(section);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSectionBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [section] = await db
    .update(menuSectionsTable)
    .set(parsed.data)
    .where(eq(menuSectionsTable.id, Number(id)))
    .returning();

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  return NextResponse.json(section);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const { id } = await params;
  const [section] = await db
    .delete(menuSectionsTable)
    .where(eq(menuSectionsTable.id, Number(id)))
    .returning();

  if (!section) {
    return NextResponse.json({ error: "Section not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}

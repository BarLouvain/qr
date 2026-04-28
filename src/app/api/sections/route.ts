import { NextRequest, NextResponse } from "next/server";
import { db, menuSectionsTable } from "@/lib/db";
import { asc } from "drizzle-orm";
import { isAuthorized, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const CreateSectionBody = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().optional(),
});

export async function GET() {
  const sections = await db
    .select()
    .from(menuSectionsTable)
    .orderBy(asc(menuSectionsTable.sortOrder));
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  const body = await req.json();
  const parsed = CreateSectionBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const [section] = await db
    .insert(menuSectionsTable)
    .values({ ...parsed.data, sortOrder: parsed.data.sortOrder ?? 0 })
    .returning();

  return NextResponse.json(section, { status: 201 });
}

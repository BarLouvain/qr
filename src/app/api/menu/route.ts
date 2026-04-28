import { NextResponse } from "next/server";
import { db, menuSectionsTable, menuCategoriesTable, menuItemsTable } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  const sections = await db
    .select()
    .from(menuSectionsTable)
    .orderBy(asc(menuSectionsTable.sortOrder));

  const categories = await db
    .select()
    .from(menuCategoriesTable)
    .orderBy(asc(menuCategoriesTable.sortOrder));

  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.active, true))
    .orderBy(asc(menuItemsTable.sortOrder));

  const result = sections.map((section) => ({
    ...section,
    categories: categories
      .filter((c) => c.sectionId === section.id)
      .map((category) => ({
        ...category,
        items: items.filter((i) => i.categoryId === category.id),
      })),
  }));

  return NextResponse.json(result);
}

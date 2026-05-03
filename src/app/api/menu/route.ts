import { NextRequest, NextResponse } from "next/server";
import { db, menuSectionsTable, menuCategoriesTable, menuItemsTable } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";

export async function GET(req: NextRequest) {
  const subdomain = req.headers.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);

  if (!restaurant) {
    return NextResponse.json([], { status: 200 });
  }

  const sections = await db
    .select()
    .from(menuSectionsTable)
    .where(eq(menuSectionsTable.restaurantId, restaurant.id))
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

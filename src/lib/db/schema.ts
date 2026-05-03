import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  address: text("address"),
  logoUrl: text("logo_url"),
  tagline: text("tagline"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  googleReviewUrl: text("google_review_url"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const menuSectionsTable = pgTable("menu_sections", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurantsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuTagsTable = pgTable("menu_tags", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull().default(""),
  bgColor: text("bg_color").notNull().default("#f0f0f0"),
  textColor: text("text_color").notNull().default("#555555"),
  borderColor: text("border_color").notNull().default("#dddddd"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuCategoriesTable = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => menuSectionsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategoriesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  featuredBadge: text("featured_badge"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Restaurant = typeof restaurantsTable.$inferSelect;
export type MenuTag = typeof menuTagsTable.$inferSelect;
export type MenuSection = typeof menuSectionsTable.$inferSelect;
export type MenuCategory = typeof menuCategoriesTable.$inferSelect;
export type MenuItem = typeof menuItemsTable.$inferSelect;

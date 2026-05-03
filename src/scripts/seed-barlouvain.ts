import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { and, eq, isNull } from "drizzle-orm";
import {
  restaurantsTable,
  menuTagsTable,
  menuSectionsTable,
  menuCategoriesTable,
  menuItemsTable,
} from "../lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const DEFAULT_TAGS = [
  { value: "bestseller", label: "Bestseller", icon: "⭐", bgColor: "#fff4e0", textColor: "#9a6a00", borderColor: "#ffe0a0", sortOrder: 0 },
  { value: "popular", label: "Berucht", icon: "🔥", bgColor: "#fef0ee", textColor: "#c93a20", borderColor: "#fac8be", sortOrder: 1 },
  { value: "alcoholvrij", label: "Alcoholvrij", icon: "🥤", bgColor: "#eef6ee", textColor: "#2e7a2e", borderColor: "#b8ddb8", sortOrder: 2 },
  { value: "vegetarisch", label: "Vegetarisch", icon: "🌿", bgColor: "#eef6ee", textColor: "#2e7a2e", borderColor: "#b8ddb8", sortOrder: 3 },
  { value: "glutenvrij", label: "Glutenvrij", icon: "🌾", bgColor: "#fdf6e3", textColor: "#8a6200", borderColor: "#f0d98a", sortOrder: 4 },
];

const menuData = [
  {
    title: "Cocktails", slug: "cocktails", sortOrder: 0,
    categories: [
      {
        label: "Cocktails", sortOrder: 0,
        items: [
          { name: "Pornstar Martini", description: "Passievrucht, vanille", price: "13", tags: ["bestseller"], featured: true, featuredBadge: "★ Our Bestseller", sortOrder: 0 },
          { name: "Lazy Red Cheeks", description: "Frambozen, viooltjes en een gezonde blos — Vodka, limoen, framboos, violette", price: "12.5", sortOrder: 1 },
          { name: "Caipirinha", description: "Zuur, zoet en een Braziliaanse ziel — Cachaça, limoen, rietsuiker", price: "12", sortOrder: 2 },
          { name: "Mojito", description: "Munt, limoen en een vleugje magie", price: "12", sortOrder: 3 },
          { name: "Strawberry Mojito", description: "Zoet, fris en zomers", price: "12", sortOrder: 4 },
          { name: "Margarita", description: "Silver Tequila, triple sec, limoen", price: "12", sortOrder: 5 },
          { name: "Dark & Stormy", description: "Black Spiced Rum, ginger beer, vers limoensap", price: "12.5", sortOrder: 6 },
          { name: "Moscow Mule", description: "Vodka, ginger beer, vers limoensap", price: "12.5", sortOrder: 7 },
          { name: "Long Island Iced Tea", description: "Intens – Complex – Berucht. Bevat 5 spirits en 0% thee.", price: "14", tags: ["popular"], sortOrder: 8 },
          { name: "Negroni", description: "Italiaanse klassieker — Campari, gin, rode vermouth", price: "12", sortOrder: 9 },
          { name: "Cuba Libre", description: "Bruine rum, limoen, cola", price: "12", sortOrder: 10 },
          { name: "Amaretto Sour", description: "Amaretto, citroen, suiker", price: "12", sortOrder: 11 },
          { name: "Mai Tai", description: "Donkere rum, overproof rum, triple sec, limoen, amandel", price: "12", sortOrder: 12 },
        ],
      },
      {
        label: "Mocktails", sortOrder: 1,
        items: [
          { name: "Passionfruit Martini", description: "Passievrucht & vanille", price: "9.5", tags: ["alcoholvrij"], featured: true, featuredBadge: "★ Most Popular", sortOrder: 0 },
          { name: "Ipanema", description: "Passievrucht & Ginger Beer", price: "9", tags: ["alcoholvrij"], sortOrder: 1 },
          { name: "Crazy Red Cheeks", description: "Framboos, limoen en een zachte zoete kick", price: "9", tags: ["alcoholvrij"], sortOrder: 2 },
          { name: "Responsible Spritz", description: "Alcoholvrije Aperol met een twist", price: "9.5", tags: ["alcoholvrij"], sortOrder: 3 },
          { name: "Virgin Mojito", description: "Verse munt, limoen en Ginger Ale", price: "8.5", tags: ["alcoholvrij"], sortOrder: 4 },
        ],
      },
    ],
  },
  {
    title: "Bier", slug: "bier", sortOrder: 1,
    categories: [
      {
        label: "Bier van 't Vat", sortOrder: 0,
        items: [
          { name: "Stella Artois", price: "3.3", sortOrder: 0 },
          { name: "Gouden Carolus Tripel", price: "4.9", sortOrder: 1 },
          { name: "Delirium Tremens", price: "5.2", sortOrder: 2 },
          { name: "Kasteelbier Rouge", price: "4.8", sortOrder: 3 },
          { name: "Tripel Karmeliet", price: "5.2", sortOrder: 4 },
          { name: "Delirium Red", description: "Fruit Beer", price: "5.2", sortOrder: 5 },
          { name: "Delirio", description: "Alcoholvrije Delirium", price: "4.5", tags: ["alcoholvrij"], sortOrder: 6 },
        ],
      },
      {
        label: "Bier op Fles", sortOrder: 1,
        items: [
          { name: "Hoegaarden", price: "4", sortOrder: 0 },
          { name: "Gulden Draak", price: "5.6", sortOrder: 1 },
          { name: "Leffe Blond", price: "5.3", sortOrder: 2 },
          { name: "Duvel", price: "5.2", sortOrder: 3 },
          { name: "La Chouffe", price: "5.2", sortOrder: 4 },
          { name: "Cornet", price: "5.4", sortOrder: 5 },
          { name: "Westmalle Tripel", price: "5.5", sortOrder: 6 },
          { name: "Orval", price: "6", sortOrder: 7 },
          { name: "Kriek Lindemans", price: "4.5", sortOrder: 8 },
          { name: "Hoegaarden Rosée", price: "4.5", sortOrder: 9 },
          { name: "Cherry Chouffe", price: "5.3", sortOrder: 10 },
          { name: "Strongbow Gold Apple / Red Berries", price: "5.5", sortOrder: 11 },
          { name: "Corona", price: "5.5", sortOrder: 12 },
          { name: "Salitos Blue / Tequila", price: "5.5", sortOrder: 13 },
          { name: "Stella 0.0", price: "3.3", tags: ["alcoholvrij"], sortOrder: 14 },
          { name: "Liefmans 0.0", price: "4.5", tags: ["alcoholvrij"], sortOrder: 15 },
          { name: "Leffe Blond 0.0", price: "4.8", tags: ["alcoholvrij"], sortOrder: 16 },
          { name: "Cornet Alcohol-Free", price: "4.9", tags: ["alcoholvrij"], sortOrder: 17 },
        ],
      },
    ],
  },
  {
    title: "Dranken", slug: "dranken", sortOrder: 2,
    categories: [
      {
        label: "Apero", sortOrder: 0,
        items: [
          { name: "Sangria met vers fruit", description: "Rood of Wit", price: "11", sortOrder: 0 },
          { name: "Aperol Spritz", price: "10", sortOrder: 1 },
          { name: "Saint Germain Spritz (Hugo)", price: "11", sortOrder: 2 },
          { name: "Limoncello / Campari Spritz", price: "11", sortOrder: 3 },
          { name: "Passoã", price: "6.5", sortOrder: 4 },
          { name: "Campari", price: "6.5", sortOrder: 5 },
          { name: "Mixer fruitsap", price: "3.5", sortOrder: 6 },
        ],
      },
      {
        label: "Gin & Tonic", note: "Inclusief Schweppes mixer", sortOrder: 1,
        items: [
          { name: "Bombay Sapphire", price: "13", sortOrder: 0 },
          { name: "Bombay Bramble", price: "13.5", sortOrder: 1 },
          { name: "Gin Mare", price: "14.5", sortOrder: 2 },
          { name: "Hendrick's Gin", price: "14.5", sortOrder: 3 },
        ],
      },
      {
        label: "Frisdranken", sortOrder: 2,
        items: [
          { name: "Chaudfontaine Plat / Bruis", price: "3.2", sortOrder: 0 },
          { name: "Chaudfontaine Plat / Bruis 50cl", price: "6", sortOrder: 1 },
          { name: "Coca Cola Regular / Zero", price: "3.3", sortOrder: 2 },
          { name: "Fanta Orange", price: "3.3", sortOrder: 3 },
          { name: "Sprite", price: "3.3", sortOrder: 4 },
          { name: "Red Bull", price: "4.8", sortOrder: 5 },
          { name: "Minute Maid", description: "Orange, Appel, Appelkers", price: "3.8", sortOrder: 6 },
          { name: "Lipton Ice Tea Regular / Green", price: "3.8", sortOrder: 7 },
          { name: "Schweppes Tonic / Agrum'", price: "4", sortOrder: 8 },
          { name: "Schweppes Original", price: "4.5", sortOrder: 9 },
          { name: "Schweppes Ginger Beer", price: "4.5", sortOrder: 10 },
        ],
      },
      {
        label: "Warme Dranken", sortOrder: 3,
        items: [
          { name: "Koffie / Deca", price: "3.5", sortOrder: 0 },
          { name: "Espresso", price: "3.5", sortOrder: 1 },
          { name: "Warme Chocomelk", price: "4.5", sortOrder: 2 },
          { name: "Cappuccino met melkschuim", price: "4.5", sortOrder: 3 },
          { name: "Cappuccino met slagroom", price: "4.7", sortOrder: 4 },
          { name: "Koffie Verkeerd", price: "4.5", sortOrder: 5 },
          { name: "Latte Macchiato", price: "4.5", sortOrder: 6 },
          { name: "Thee", description: "Earl Grey, Kamille, Bosvruchten, Groene, Citroen, Munt, Natuur", price: "3.5", sortOrder: 7 },
          { name: "Verse Muntthee", price: "4.5", sortOrder: 8 },
          { name: "Verse Gemberthee", price: "4.5", sortOrder: 9 },
          { name: "Baileys Coffee", description: "Met Baileys Original", price: "11", sortOrder: 10 },
          { name: "Irish Coffee", description: "Met Jameson Whiskey", price: "11", sortOrder: 11 },
          { name: "Italian Coffee", description: "Met Amaretto", price: "11", sortOrder: 12 },
        ],
      },
    ],
  },
  {
    title: "Wijn & Bubbels", slug: "wijn", sortOrder: 3,
    categories: [
      {
        label: "Wijn", sortOrder: 0,
        items: [
          { name: "Fraktique Wit", description: "Grenache, Blanc, Sauvignon (FR)", price: "5.5 | 26", sortOrder: 0 },
          { name: "Sonstraal Wit", description: "Zoet, Chenin Blanc (ZA)", price: "5.5 | 26", sortOrder: 1 },
          { name: "Fraktique Rosé", description: "Grenache Gris (FR)", price: "5.5 | 26", sortOrder: 2 },
          { name: "Fraktique Rood Merlot", description: "Cabernet Sauvignon (FR)", price: "5.5 | 26", sortOrder: 3 },
        ],
      },
      {
        label: "Bubbels", sortOrder: 1,
        items: [
          { name: "Prosecco Le Couchon Brut", price: "7.5 | 35", sortOrder: 0 },
          { name: "Prosecco Le Couchon Rosé", price: "45", sortOrder: 1 },
          { name: "Laurent Perrier Brut", price: "90", sortOrder: 2 },
          { name: "Laurent Perrier Rosé", price: "135", sortOrder: 3 },
          { name: "Moët & Chandon ICE", price: "120", sortOrder: 4 },
        ],
      },
    ],
  },
  {
    title: "Sterke Drank", slug: "sterkedrank", sortOrder: 4,
    categories: [
      {
        label: "Vodka", sortOrder: 0,
        items: [
          { name: "Eristoff Brut / Red", price: "7", sortOrder: 0 },
          { name: "Grey Goose", price: "11", sortOrder: 1 },
        ],
      },
      {
        label: "Rum", sortOrder: 1,
        items: [
          { name: "Bacardi Carta Blanca", price: "8", sortOrder: 0 },
          { name: "Bacardi 4Y", price: "8", sortOrder: 1 },
          { name: "Bacardi 8Y", price: "10", sortOrder: 2 },
          { name: "Bacardi Razz", price: "7", sortOrder: 3 },
          { name: "Malibu", price: "7", sortOrder: 4 },
          { name: "Kraken Black Spiced Rum", price: "10", sortOrder: 5 },
        ],
      },
      {
        label: "Whisky", sortOrder: 2,
        items: [
          { name: "Jack Daniel's", price: "8.5", sortOrder: 0 },
          { name: "Jack Daniel's Honey / Apple", price: "8.5", sortOrder: 1 },
          { name: "William Lawson", price: "7.5", sortOrder: 2 },
          { name: "Jameson Irish Whiskey", price: "8.5", sortOrder: 3 },
          { name: "Dewar's 12Y", price: "11", sortOrder: 4 },
        ],
      },
      {
        label: "After Dinner", sortOrder: 3,
        items: [
          { name: "Amaretto Disaronno", price: "7", sortOrder: 0 },
          { name: "Licor 43", price: "7", sortOrder: 1 },
          { name: "Baileys Original", price: "7", sortOrder: 2 },
          { name: "Sambuca", price: "7", sortOrder: 3 },
          { name: "Hennessy VS", price: "11", sortOrder: 4 },
        ],
      },
      {
        label: "Shots", sortOrder: 4,
        items: [
          { name: "Tequila shot", price: "4", sortOrder: 0 },
          { name: "Blue Thrill", price: "4", sortOrder: 1 },
          { name: "Jägermeister shot", price: "4", sortOrder: 2 },
          { name: "Jägerbomb", price: "6.5", sortOrder: 3 },
          { name: "Sambuca shot", price: "4", sortOrder: 4 },
          { name: "Limoncello shot", price: "4", sortOrder: 5 },
          { name: "Licor 43 shot", price: "4", sortOrder: 6 },
          { name: "Rocketshot", price: "4", sortOrder: 7 },
          { name: "Flügel", price: "4", sortOrder: 8 },
        ],
      },
      {
        label: "Flessen Sterke Drank", note: "Inclusief 4 frisdranken", sortOrder: 5,
        items: [
          { name: "Eristoff Brut / Red", price: "85", sortOrder: 0 },
          { name: "Grey Goose", price: "125", sortOrder: 1 },
          { name: "Bacardi Carta Blanca / 4Y", price: "90", sortOrder: 2 },
          { name: "Bacardi 8Y", price: "120", sortOrder: 3 },
          { name: "Bacardi Razz", price: "85", sortOrder: 4 },
          { name: "Jack Daniel's", price: "110", sortOrder: 5 },
          { name: "Hennessy VS", price: "120", sortOrder: 6 },
        ],
      },
    ],
  },
  {
    title: "Bites", slug: "bites", sortOrder: 5,
    categories: [
      {
        label: "Bites", sortOrder: 0,
        items: [
          { name: "Nachos Pick and Dip", description: "Met Guacamole & tomatensalsa", price: "9", sortOrder: 0 },
          { name: "Portie Olijven", price: "7", sortOrder: 1 },
          { name: "Portie Kaas", price: "9", sortOrder: 2 },
          { name: "Portie Kaas & Salami", price: "13", sortOrder: 3 },
          { name: "Croque uit 't Vuistje", price: "7", sortOrder: 4 },
          { name: "Pizza Margherita to share", price: "14.5", sortOrder: 5 },
          { name: "Portie Warm Gemengd", price: "16", sortOrder: 6 },
        ],
      },
    ],
  },
];

async function seed() {
  console.log("Seeding Bar Louvain...");

  const [restaurant] = await db
    .insert(restaurantsTable)
    .values({
      name: "Bar Louvain",
      subdomain: "barlouvain",
      address: "Leuven",
      logoUrl: "/logo-barlouvain.png",
      instagramUrl: null,
      facebookUrl: null,
      googleReviewUrl: null,
      password: process.env.BAR_LOUVAIN_PASSWORD ?? "changeme",
    })
    .onConflictDoUpdate({
      target: restaurantsTable.subdomain,
      set: { name: "Bar Louvain", logoUrl: "/logo-barlouvain.png" },
    })
    .returning();

  console.log(`Restaurant: ${restaurant.name} (id=${restaurant.id})`);

  // Seed default tags
  for (const tag of DEFAULT_TAGS) {
    const [existing] = await db
      .select()
      .from(menuTagsTable)
      .where(and(eq(menuTagsTable.restaurantId, restaurant.id), eq(menuTagsTable.value, tag.value)));
    if (!existing) {
      await db.insert(menuTagsTable).values({ ...tag, restaurantId: restaurant.id });
      console.log(`  Tag "${tag.label}" aangemaakt`);
    }
  }

  // Seed menu
  for (const sectionData of menuData) {
    const { categories, ...sectionFields } = sectionData;

    const [existing] = await db
      .select()
      .from(menuSectionsTable)
      .where(and(eq(menuSectionsTable.slug, sectionFields.slug), eq(menuSectionsTable.restaurantId, restaurant.id)));

    if (existing) {
      console.log(`Section "${sectionFields.title}" already exists, skipping.`);
      continue;
    }

    const [section] = await db
      .insert(menuSectionsTable)
      .values({ ...sectionFields, restaurantId: restaurant.id })
      .returning();

    for (const categoryData of categories) {
      const { items, ...categoryFields } = categoryData as any;
      const [category] = await db
        .insert(menuCategoriesTable)
        .values({ ...categoryFields, sectionId: section.id })
        .returning();

      for (const itemData of items) {
        await db.insert(menuItemsTable).values({
          ...itemData,
          categoryId: category.id,
          tags: (itemData as any).tags ?? [],
          featured: (itemData as any).featured ?? false,
          active: true,
        });
      }
      console.log(`  Categorie "${categoryFields.label}" — ${items.length} items`);
    }
    console.log(`Section "${sectionFields.title}" aangemaakt`);
  }

  console.log("Klaar!");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

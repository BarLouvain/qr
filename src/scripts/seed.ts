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

const DEFAULT_TAGS = [
  { value: "bestseller", label: "Bestseller", icon: "⭐", bgColor: "#fff4e0", textColor: "#9a6a00", borderColor: "#ffe0a0", sortOrder: 0 },
  { value: "popular", label: "Berucht", icon: "🔥", bgColor: "#fef0ee", textColor: "#c93a20", borderColor: "#fac8be", sortOrder: 1 },
  { value: "alcoholvrij", label: "Alcoholvrij", icon: "🥤", bgColor: "#eef6ee", textColor: "#2e7a2e", borderColor: "#b8ddb8", sortOrder: 2 },
  { value: "vegetarisch", label: "Vegetarisch", icon: "🌿", bgColor: "#eef6ee", textColor: "#2e7a2e", borderColor: "#b8ddb8", sortOrder: 3 },
  { value: "glutenvrij", label: "Glutenvrij", icon: "🌾", bgColor: "#fdf6e3", textColor: "#8a6200", borderColor: "#f0d98a", sortOrder: 4 },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const menuData = [
  {
    title: "Eten", slug: "eten", sortOrder: 0,
    categories: [
      {
        label: "Croques", note: "Onze croques worden geserveerd met een fris slaatje.", sortOrder: 0,
        items: [
          { name: "Croque uit 't Vuistje", description: "Zonder groenten", price: "7", sortOrder: 0 },
          { name: "Croque Monsieur", price: "11", sortOrder: 1 },
          { name: "Croque Zalm", description: "Met gerookte zalm en kruidenkaas", price: "14", sortOrder: 2 },
          { name: "Italian Croque", description: "Met mozzarella, pesto verde en zongedroogde tomaten", price: "13.5", sortOrder: 3 },
          { name: "Croque met Brie & Honing", price: "13.5", sortOrder: 4 },
          { name: "Croque Serrano", description: "Met Serranoham, kaas en bruin brood", price: "14", sortOrder: 5 },
          { name: "Croque Bolognese", description: "Met huisgemaakte Bolognesesaus", price: "15", sortOrder: 6 },
        ],
      },
      {
        label: "Pasta", sortOrder: 1,
        items: [
          { name: "Kleine Spaghetti Bolognese", price: "13", sortOrder: 0 },
          { name: "Spaghetti Bolognese", price: "16", sortOrder: 1 },
          { name: "Pasta Pesto", price: "16", sortOrder: 2 },
        ],
      },
      {
        label: "Pizza", sortOrder: 2,
        items: [
          { name: "Pizza Margherita", price: "14.5", sortOrder: 0 },
          { name: "Pizza Pepperoni", price: "17", sortOrder: 1 },
          { name: "Pizza Prosciutto di Parma", price: "19", sortOrder: 2 },
          { name: "Pizza BBQ Chicken", price: "19", sortOrder: 3 },
        ],
      },
      {
        label: "Nachos", sortOrder: 3,
        items: [
          { name: "Nachos Pick and Dip", description: "Met guacamole en tomatensalsa", price: "9", sortOrder: 0 },
          { name: "Nachos Royal", description: "Met gesmolten kaas en tomatensalsa, uit de oven", price: "13", sortOrder: 1 },
          { name: "Pulled Pork Nachos", description: "Met gesmolten kaas, tomatensalsa en pulled pork, uit de oven", price: "17", sortOrder: 2 },
          { name: "Pulled Chicken Nachos", description: "Met gesmolten kaas, tomatensalsa en pulled chicken, uit de oven", price: "17", sortOrder: 3 },
        ],
      },
      {
        label: "Fingerfood", sortOrder: 4,
        items: [
          { name: "Portie Olijven", price: "7", sortOrder: 0 },
          { name: "Mini Loempia's", price: "8", sortOrder: 1 },
          { name: "Portie Kaas", price: "9", sortOrder: 2 },
          { name: "Calamares Fritti met Tartaar", price: "9", sortOrder: 3 },
          { name: "Chicken Nuggets", price: "9", sortOrder: 4 },
          { name: "Onion Rings", price: "9", sortOrder: 5 },
          { name: "Portie Kaas & Salami", price: "13", sortOrder: 6 },
          { name: "Portie Warm Gemengd", description: "Bitterballen, curryworstjes, kaasballetjes, chicken nuggets", price: "16", sortOrder: 7 },
          { name: "Chicken Wings", price: "10", sortOrder: 8 },
        ],
      },
      {
        label: "Zoetigheden", sortOrder: 5,
        items: [
          { name: "Wafel Suiker", price: "7", sortOrder: 0 },
          { name: "Wafel Slagroom", price: "8.5", sortOrder: 1 },
          { name: "Wafel Nutella", price: "8.5", sortOrder: 2 },
          { name: "Wafel met IJs", price: "10", sortOrder: 3 },
          { name: "Wafel met Verse Aardbeien", price: "12.5", sortOrder: 4 },
          { name: "Poffertjes Suiker", price: "6.5", sortOrder: 5 },
          { name: "Poffertjes Nutella", price: "7.5", sortOrder: 6 },
        ],
      },
      {
        label: "After Dinner", sortOrder: 6,
        items: [
          { name: "Amaretto Disaronno", price: "7", sortOrder: 0 },
          { name: "Baileys Original", price: "7", sortOrder: 1 },
          { name: "Licor 43", price: "7", sortOrder: 2 },
          { name: "Sambuca", price: "7", sortOrder: 3 },
          { name: "Limoncello", price: "7", sortOrder: 4 },
        ],
      },
    ],
  },
  {
    title: "Cocktails", slug: "cocktails", sortOrder: 1,
    categories: [
      {
        label: "Cocktails", sortOrder: 0,
        items: [
          { name: "Pornstar Martini", description: "Passievrucht, vanille", price: "13", tags: ["bestseller"], featured: true, featuredBadge: "★ Our Bestseller", sortOrder: 0 },
          { name: "Lazy Red Cheeks", description: "Frambozen, viooltjes en een gezonde blos — Vodka, limoen, framboos, violette", price: "12.5", sortOrder: 1 },
          { name: "Caipirinha", description: "Cachaça rum, limoen, rietsuiker", price: "12", sortOrder: 2 },
          { name: "Pink Paloma", description: "Tequila, Fever Tree Grapefruit, limoensap", price: "13", sortOrder: 3 },
          { name: "Margarita", description: "Silver Tequila, triple sec, limoen", price: "12", sortOrder: 4 },
          { name: "Dark & Stormy", description: "Black Spiced Rum, ginger beer, vers limoensap", price: "12.5", sortOrder: 5 },
          { name: "Moscow Mule", description: "Vodka, ginger beer, vers limoensap", price: "12.5", sortOrder: 6 },
          { name: "Long Island Iced Tea", description: "Intens – Complex – Berucht. Bevat 5 spirits en 0% thee.", price: "14", tags: ["popular"], sortOrder: 7 },
          { name: "Negroni", description: "Campari, gin, rode vermouth", price: "12", sortOrder: 8 },
          { name: "Cuba Libre", description: "Bruine rum, limoen, cola", price: "12", sortOrder: 9 },
          { name: "Cosmo", description: "Vodka, triple sec, limoen, veenbessensap", price: "12", sortOrder: 10 },
          { name: "Mai Tai", description: "Donkere rum, overproof rum, triple sec, limoen, amandel", price: "12", sortOrder: 11 },
          { name: "Sex on the Beach", description: "Vodka, Bols Peach, ananassap, veenbessensap", price: "12", sortOrder: 12 },
          { name: "Tequila Sunrise", description: "Tequila, vers fruitsap, grenadine", price: "12", sortOrder: 13 },
          { name: "Blue Breeze", description: "Blue Curaçao, vodka, citroen, Sprite", price: "12", sortOrder: 14 },
          { name: "Mexican Mule", description: "Patron Silver tequila, ginger beer, vers limoensap", price: "14.5", sortOrder: 15 },
          { name: "Piña Colada", description: "Malibu, kokosroom, ananas", price: "12", sortOrder: 16 },
          { name: "Espresso Martini", description: "Espresso, vodka, kahlua", price: "12.5", tags: ["popular"], sortOrder: 17 },
          { name: "Sweety Peach", description: "Witte rum, perzik, limoen", price: "12.5", sortOrder: 18 },
          { name: "Pink Panther", description: "Gin, pompelmoessap, tonic", price: "12", sortOrder: 19 },
          { name: "Strawberry Caipirinha", description: "Cachaça rum, aardbei, limoen, rietsuiker", price: "12", sortOrder: 20 },
        ],
      },
      {
        label: "Mojitos", sortOrder: 1,
        items: [
          { name: "Mojito", description: "Bacardi Carta Blanca, munt, limoen, rietsuiker", price: "12", sortOrder: 0 },
          { name: "Strawberry Mojito", description: "Bacardi Carta Blanca, munt, limoen, aardbeien, rietsuiker", price: "12", sortOrder: 1 },
          { name: "Mojito Razz", description: "Bacardi Razz, munt, limoen, framboos, rietsuiker", price: "12", sortOrder: 2 },
          { name: "Mojito Passion", description: "Bacardi Carta Blanca, munt, limoen, passievrucht, rietsuiker", price: "12", sortOrder: 3 },
          { name: "Mojito Mango", description: "Bacardi Carta Blanca, munt, limoen, mango, rietsuiker", price: "12", sortOrder: 4 },
        ],
      },
      {
        label: "Sours", sortOrder: 2,
        items: [
          { name: "Amaretto Sour", description: "Amaretto, citroen, suiker", price: "12", sortOrder: 0 },
          { name: "Whisky Sour", description: "Whisky, citroen, suiker", price: "12", sortOrder: 1 },
          { name: "Apple Sour", description: "Jack Daniel's Apple Whisky, citroen, suiker", price: "12.5", sortOrder: 2 },
        ],
      },
      {
        label: "Warme Koffiecocktails", sortOrder: 3,
        items: [
          { name: "Baileys Coffee", description: "Met Baileys Original", price: "11", sortOrder: 0 },
          { name: "Irish Coffee", description: "Met Jameson Whiskey", price: "11", sortOrder: 1 },
          { name: "Italian Coffee", description: "Met Amaretto", price: "11", sortOrder: 2 },
          { name: "Spanish Coffee", description: "Met Licor 43", price: "11", sortOrder: 3 },
        ],
      },
    ],
  },
  {
    title: "Mocktails", slug: "mocktails", sortOrder: 2,
    categories: [
      {
        label: "Alcoholvrij", sortOrder: 0,
        items: [
          { name: "Passionfruit Martini", description: "Passievrucht & vanille", price: "10", tags: ["alcoholvrij"], featured: true, featuredBadge: "★ Most Popular", sortOrder: 0 },
          { name: "Ipanema", description: "Passievrucht & Ginger Beer", price: "9", tags: ["alcoholvrij"], sortOrder: 1 },
          { name: "Crazy Red Cheeks", description: "Framboos, limoen en een zachte zoete kick", price: "9", tags: ["alcoholvrij"], sortOrder: 2 },
          { name: "Responsible Spritz", description: "Alcoholvrije Spritz met een twist", price: "9.5", tags: ["alcoholvrij"], sortOrder: 3 },
          { name: "Ambrosia", description: "Veenbessen, framboos, citroen", price: "9", tags: ["alcoholvrij"], sortOrder: 4 },
          { name: "Virgin Mojito", description: "Verse munt, limoen en Ginger Ale", price: "8.5", tags: ["alcoholvrij"], sortOrder: 5 },
          { name: "Virgin Strawberry Mojito", description: "Aardbei, verse munt, limoen en Ginger Ale", price: "9", tags: ["alcoholvrij"], sortOrder: 6 },
        ],
      },
    ],
  },
  {
    title: "Dranken", slug: "dranken", sortOrder: 3,
    categories: [
      {
        label: "Warme Dranken", sortOrder: 0,
        items: [
          { name: "Koffie / Deca", price: "3.5", sortOrder: 0 },
          { name: "Espresso", price: "3.5", sortOrder: 1 },
          { name: "Cappuccino met melkschuim", price: "4.5", sortOrder: 2 },
          { name: "Cappuccino met slagroom", price: "4.7", sortOrder: 3 },
          { name: "Koffie Verkeerd", price: "4.5", sortOrder: 4 },
          { name: "Latte Macchiato", description: "Chocolate, Vanille, Caramel of Apple Pie", price: "4.5", sortOrder: 5 },
          { name: "Latte Speculoos / Oreo", price: "5.8", sortOrder: 6 },
          { name: "Thee", description: "Earl Grey, Kamille, Bosvruchten, Groen, Citroen, Munt, Rooibos, Natuur, Rozenbottel", price: "3.5", sortOrder: 7 },
          { name: "Verse Munt- of Gemberthee", price: "4.5", sortOrder: 8 },
          { name: "Warme Choco", description: "Met Callebaut chocolade", price: "4.9", sortOrder: 9 },
          { name: "Spice of Vanilla Chai Latte", price: "5.5", sortOrder: 10 },
          { name: "Matcha Latte", price: "5.5", sortOrder: 11 },
        ],
      },
      {
        label: "Apero", sortOrder: 1,
        items: [
          { name: "Sangria", description: "Met vers fruit — Wit of Rood", price: "11", sortOrder: 0 },
          { name: "Aperol Spritz", price: "10", sortOrder: 1 },
          { name: "Hugo", price: "11", sortOrder: 2 },
          { name: "Limoncello Spritz", price: "11", sortOrder: 3 },
          { name: "Campari Spritz", price: "11", sortOrder: 4 },
          { name: "Martini Bellini", price: "8.5", sortOrder: 5 },
          { name: "Martini Bianco / Rosso", price: "6.5", sortOrder: 6 },
          { name: "Martini Floreale 0.0 / Vibrante 0.0", price: "6.5", tags: ["alcoholvrij"], sortOrder: 7 },
          { name: "Passoã", price: "6.5", sortOrder: 8 },
          { name: "Campari", price: "6.5", sortOrder: 9 },
        ],
      },
      {
        label: "Gin & Tonic", note: "Inclusief mixer tonic", sortOrder: 2,
        items: [
          { name: "Bombay Sapphire", price: "13", sortOrder: 0 },
          { name: "Bombay Bramble", price: "13.5", sortOrder: 1 },
          { name: "Marula", price: "14.5", sortOrder: 2 },
          { name: "Gin Mare", price: "14.5", sortOrder: 3 },
          { name: "Copperhead", price: "14.5", sortOrder: 4 },
          { name: "Bulldog", price: "13", sortOrder: 5 },
          { name: "Hendrick's Gin", price: "14.5", sortOrder: 6 },
          { name: "Tanqueray 0.0%", price: "11", tags: ["alcoholvrij"], sortOrder: 7 },
        ],
      },
      {
        label: "Frisdranken", sortOrder: 3,
        items: [
          { name: "Chaudfontaine Plat / Bruis", price: "3.2", sortOrder: 0 },
          { name: "Chaudfontaine Plat / Bruis 50cl", price: "6", sortOrder: 1 },
          { name: "Coca Cola Regular / Zero", price: "3.3", sortOrder: 2 },
          { name: "Fanta Orange", price: "3.3", sortOrder: 3 },
          { name: "Sprite", price: "3.3", sortOrder: 4 },
          { name: "Minute Maid", description: "Orange, Appelkers, Multi of Appel", price: "3.8", sortOrder: 5 },
          { name: "Lipton Ice Tea", description: "Regular, Zero, Green of Peach", price: "4", sortOrder: 6 },
          { name: "Schweppes Tonic / Agrum' / Bitter Lemon", price: "4.5", sortOrder: 7 },
          { name: "Schweppes Gingerbeer / White Peach", price: "4.8", sortOrder: 8 },
          { name: "Red Bull", price: "4.8", sortOrder: 9 },
        ],
      },
    ],
  },
  {
    title: "Bier", slug: "bier", sortOrder: 4,
    categories: [
      {
        label: "Bier van 't Vat", sortOrder: 0,
        items: [
          { name: "Stella Artois", description: "25cl / 30cl", price: "3.3 | 3.9", sortOrder: 0 },
          { name: "Gouden Carolus Tripel", description: "33cl", price: "5.3", sortOrder: 1 },
          { name: "Kasteelbier Rouge", description: "25cl / 33cl", price: "4.8 | 5.5", sortOrder: 2 },
        ],
      },
      {
        label: "Bier op Fles", sortOrder: 1,
        items: [
          { name: "Tripel Karmeliet", price: "5.4", sortOrder: 0 },
          { name: "Delirium Tremens", price: "5.4", sortOrder: 1 },
          { name: "Omer", price: "5.2", sortOrder: 2 },
          { name: "Vedett IPA", price: "4.9", sortOrder: 3 },
          { name: "Oude Geuze Boon", price: "4.7", sortOrder: 4 },
          { name: "Hoegaarden", price: "4", sortOrder: 5 },
          { name: "Gulden Draak Classic – 9000", price: "5.6", sortOrder: 6 },
          { name: "Leffe Blond / Bruin", price: "5.3", sortOrder: 7 },
          { name: "Gouden Carolus Classic", price: "5.2", sortOrder: 8 },
          { name: "Barbãr", price: "4.9", sortOrder: 9 },
          { name: "Duvel", price: "5.2", sortOrder: 10 },
          { name: "La Chouffe", price: "5.2", sortOrder: 11 },
          { name: "Cornet", price: "5.4", sortOrder: 12 },
          { name: "Brugse Zot", price: "5.3", sortOrder: 13 },
          { name: "Wolf 7 Blond", price: "5.3", sortOrder: 14 },
          { name: "Westmalle Tripel", price: "5.5", sortOrder: 15 },
          { name: "Orval", price: "6", sortOrder: 16 },
          { name: "Chimay Blauw", price: "6", sortOrder: 17 },
          { name: "Lindemans Kriek / Perzik / Framboos", price: "4.5", sortOrder: 18 },
          { name: "Hoegaarden Rosée", price: "5.3", sortOrder: 19 },
          { name: "Cherry Chouffe", price: "5.5", sortOrder: 20 },
          { name: "Stëlz Peach / Lemon / Mango", price: "5.5", sortOrder: 21 },
          { name: "Strongbow Apple / Red Berries", price: "5.5", sortOrder: 22 },
          { name: "Salitos Blue / Ice / Tequila", price: "5.5", sortOrder: 23 },
        ],
      },
      {
        label: "Alcoholvrij Bier", sortOrder: 2,
        items: [
          { name: "Stella 0.0", price: "3.3", tags: ["alcoholvrij"], sortOrder: 0 },
          { name: "Leffe Blond 0.0", price: "4.9", tags: ["alcoholvrij"], sortOrder: 1 },
          { name: "Kasteelbier Rouge 0.0%", price: "4.9", tags: ["alcoholvrij"], sortOrder: 2 },
          { name: "Tripel Karmeliet Alcoholvrij", price: "4.9", tags: ["alcoholvrij"], sortOrder: 3 },
          { name: "Cornet Alcoholvrij", price: "4.9", tags: ["alcoholvrij"], sortOrder: 4 },
        ],
      },
    ],
  },
  {
    title: "Sterke Drank", slug: "sterkedrank", sortOrder: 5,
    categories: [
      {
        label: "Whisky", sortOrder: 0,
        items: [
          { name: "Jack Daniel's", price: "8.5", sortOrder: 0 },
          { name: "Jack Daniel's Honey", price: "8.5", sortOrder: 1 },
          { name: "Jack Daniel's Apple / Blackberry", price: "8.5", sortOrder: 2 },
          { name: "Gentleman Jack", price: "10", sortOrder: 3 },
          { name: "William Lawson", price: "7.5", sortOrder: 4 },
          { name: "Jameson Irish Whiskey", price: "8.5", sortOrder: 5 },
          { name: "Dewar's 12Y", price: "11", sortOrder: 6 },
          { name: "Dewar's 18Y", price: "14", sortOrder: 7 },
          { name: "Chivas Regal 12Y", price: "9.5", sortOrder: 8 },
          { name: "Bulleit Bourbon", price: "11", sortOrder: 9 },
          { name: "Aberfeldy 12Y", price: "11", sortOrder: 10 },
          { name: "The Devron 12Y", price: "11", sortOrder: 11 },
        ],
      },
      { label: "Vodka", sortOrder: 1, items: [{ name: "Eristoff Brut / Red / Pink", price: "6.5", sortOrder: 0 }, { name: "Grey Goose", price: "11", sortOrder: 1 }] },
      {
        label: "Rum", sortOrder: 2,
        items: [
          { name: "Bacardi Carta Blanca / 4Y", price: "8", sortOrder: 0 },
          { name: "Bacardi 8Y", price: "10", sortOrder: 1 },
          { name: "Bacardi Razz", price: "7", sortOrder: 2 },
          { name: "Bacardi Spiced", price: "9", sortOrder: 3 },
          { name: "Malibu", price: "7", sortOrder: 4 },
          { name: "Kraken Black Spiced Rum", price: "10", sortOrder: 5 },
          { name: "Don Papa Masskara", price: "10", sortOrder: 6 },
          { name: "Diplomatico Reserva Exclusiva", price: "11", sortOrder: 7 },
        ],
      },
      { label: "Tequila", sortOrder: 3, items: [{ name: "Tequila Pistoleros", price: "6", sortOrder: 0 }, { name: "Patron Silver / Reposado", price: "12 | 15", sortOrder: 1 }] },
      { label: "Cognac", sortOrder: 4, items: [{ name: "Hennessy VS", price: "11", sortOrder: 0 }, { name: "Hennessy XO", price: "28", sortOrder: 1 }] },
      { label: "Others", sortOrder: 5, items: [{ name: "Jägermeister", price: "7", sortOrder: 0 }, { name: "Jenever Appel", price: "6.5", sortOrder: 1 }, { name: "Triple Sec", price: "7", sortOrder: 2 }] },
      {
        label: "Shots", sortOrder: 6,
        items: [
          { name: "Tequila shot", price: "4", sortOrder: 0 },
          { name: "Patron Tequila shot", price: "7.5", sortOrder: 1 },
          { name: "Sourz Red Berry / Apple", price: "4", sortOrder: 2 },
          { name: "Jägermeister shot", price: "4", sortOrder: 3 },
          { name: "Jägerbomb", price: "6.5", sortOrder: 4 },
          { name: "Sambuca shot", price: "4", sortOrder: 5 },
          { name: "Limoncello shot", price: "4", sortOrder: 6 },
          { name: "Licor 43 shot", price: "4", sortOrder: 7 },
          { name: "Flügel", price: "5.5", sortOrder: 8 },
          { name: "Jenevershot", price: "4", sortOrder: 9 },
          { name: "Jack Daniel's shot", price: "6.5", sortOrder: 10 },
        ],
      },
      {
        label: "Flessen Sterke Drank", note: "Inclusief 4 frisdranken", sortOrder: 7,
        items: [
          { name: "Eristoff Brut / Red / Pink", price: "85", sortOrder: 0 },
          { name: "Grey Goose", price: "125", sortOrder: 1 },
          { name: "Grey Goose 1,5L", price: "275", sortOrder: 2 },
          { name: "Grey Goose Luminus", price: "350", sortOrder: 3 },
          { name: "Grey Goose Altius", price: "275", sortOrder: 4 },
          { name: "Grey Goose 4,5L", price: "850", sortOrder: 5 },
          { name: "Grey Goose 6L", price: "1150", sortOrder: 6 },
          { name: "Bacardi Carta Blanca", price: "90", sortOrder: 7 },
          { name: "Bacardi 4Y", price: "90", sortOrder: 8 },
          { name: "Bacardi 8Y", price: "120", sortOrder: 9 },
          { name: "Bacardi Spiced", price: "95", sortOrder: 10 },
          { name: "Bacardi Razz", price: "85", sortOrder: 11 },
          { name: "Malibu", price: "85", sortOrder: 12 },
          { name: "Kraken Black Spiced Rum", price: "110", sortOrder: 13 },
          { name: "William Lawson", price: "95", sortOrder: 14 },
          { name: "Jack Daniel's", price: "110", sortOrder: 15 },
          { name: "Jack Daniel's Honey / Apple", price: "110", sortOrder: 16 },
          { name: "Chivas Regal 12Y", price: "120", sortOrder: 17 },
          { name: "Hennessy VS", price: "85", sortOrder: 18 },
          { name: "Amaretto Disaronno", price: "70", sortOrder: 19 },
          { name: "Petermann Appel", price: "85", sortOrder: 20 },
          { name: "Baileys Original", price: "95", sortOrder: 21 },
          { name: "Passoã", price: "85", sortOrder: 22 },
          { name: "Flügel Box", price: "95", sortOrder: 23 },
          { name: "Tequila Pistoleros", price: "85", sortOrder: 24 },
          { name: "Patron Tequila Silver", price: "160", sortOrder: 25 },
          { name: "Tequila Azul", price: "400", sortOrder: 26 },
          { name: "Bombay Sapphire", price: "95", sortOrder: 27 },
          { name: "Bombay Bramble", price: "95", sortOrder: 28 },
          { name: "Gin Mare", price: "130", sortOrder: 29 },
          { name: "Hendrick's Gin", price: "125", sortOrder: 30 },
          { name: "Marula", price: "125", sortOrder: 31 },
        ],
      },
    ],
  },
  {
    title: "Bubbels & Wijn", slug: "bubbels", sortOrder: 6,
    categories: [
      {
        label: "Wijn", sortOrder: 0,
        items: [
          { name: "Romeo Wit — Sauvignon Blanc (FR)", price: "5.5 | 26", sortOrder: 0 },
          { name: "Fraktique Wit — Chardonnay (FR)", price: "5.5 | 26", sortOrder: 1 },
          { name: "Sonstraal Zoet Wit — Chenin Blanc (ZA)", price: "5.5 | 26", sortOrder: 2 },
          { name: "Crazy Tropez Rosé — Cinsault, Grenache (FR)", price: "5.5 | 26", sortOrder: 3 },
          { name: "Epicuro Rood — Montepulciano d'Abruzzo (IT)", price: "5.5 | 26", sortOrder: 4 },
        ],
      },
      {
        label: "Bubbels", sortOrder: 1,
        items: [
          { name: "Prosecco Le Couchon Brut", price: "7.5 | 35", sortOrder: 0 },
          { name: "Moët & Chandon Brut", price: "85", sortOrder: 1 },
          { name: "Moët & Chandon Ice", price: "115", sortOrder: 2 },
          { name: "Moët & Chandon Ice Rosé", price: "125", sortOrder: 3 },
          { name: "Moët & Chandon Nectar Impérial Rosé", price: "130", sortOrder: 4 },
          { name: "Veuve Clicquot Brut", price: "90", sortOrder: 5 },
          { name: "Ruinart Blanc de Blancs", price: "140", sortOrder: 6 },
          { name: "Dom Pérignon", price: "275", sortOrder: 7 },
          { name: "Armand de Brignac", price: "550", sortOrder: 8 },
        ],
      },
    ],
  },
];

async function seed() {
  console.log("Seeding...");

  // 1. Create/update the karément restaurant record
  const [restaurant] = await db
    .insert(restaurantsTable)
    .values({
      name: "karément",
      subdomain: "karement",
      address: "Oudemarkt 43, Leuven",
      password: process.env.ADMIN_PASSWORD ?? "changeme",
    })
    .onConflictDoUpdate({
      target: restaurantsTable.subdomain,
      set: { name: "karément", address: "Oudemarkt 43, Leuven" },
    })
    .returning();

  console.log(`Restaurant: ${restaurant.name} (id=${restaurant.id})`);

  // 2. Seed default tags (skip if already exist)
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

  // 3. Migrate any existing sections that have no restaurantId
  const migrated = await db
    .update(menuSectionsTable)
    .set({ restaurantId: restaurant.id })
    .where(isNull(menuSectionsTable.restaurantId))
    .returning();

  if (migrated.length > 0) {
    console.log(`Migrated ${migrated.length} existing sections to restaurant ${restaurant.id}`);
  }

  // 4. Seed menu data (skips sections that already exist for this restaurant)
  for (const sectionData of menuData) {
    const { categories, ...sectionFields } = sectionData;

    const [existing] = await db
      .select()
      .from(menuSectionsTable)
      .where(
        and(
          eq(menuSectionsTable.slug, sectionFields.slug),
          eq(menuSectionsTable.restaurantId, restaurant.id)
        )
      );

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

      console.log(`  Inserted category "${categoryFields.label}" with ${items.length} items`);
    }

    console.log(`Inserted section "${sectionFields.title}"`);
  }

  console.log("Done!");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

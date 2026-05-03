import type { Metadata } from "next";
import { headers } from "next/headers";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);
  const name = restaurant?.name ?? "Menu";
  const description = [name, restaurant?.tagline, restaurant?.address].filter(Boolean).join(" — ");
  return { title: name, description };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}

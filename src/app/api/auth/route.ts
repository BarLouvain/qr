import { NextRequest, NextResponse } from "next/server";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const subdomain = req.headers.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant niet gevonden" }, { status: 404 });
  }

  if (password !== restaurant.password) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("menu_admin", String(restaurant.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dagen
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("menu_admin");
  return res;
}

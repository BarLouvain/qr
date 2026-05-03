import { NextRequest } from "next/server";

export function getRestaurantId(req: NextRequest): number | null {
  const cookie = req.cookies.get("menu_admin");
  if (!cookie?.value) return null;
  const id = parseInt(cookie.value, 10);
  return isNaN(id) ? null : id;
}

export function isAuthorized(req: NextRequest): boolean {
  return getRestaurantId(req) !== null;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

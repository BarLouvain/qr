import { NextRequest } from "next/server";

export function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("karement_admin");
  return cookie?.value === "1";
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

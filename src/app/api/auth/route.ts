import { NextRequest, NextResponse } from "next/server";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";

// In-memory rate limiter: max 10 pogingen per IP per 15 minuten
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const INVALID_CREDENTIALS = "Ongeldige inloggegevens";

export async function POST(req: NextRequest) {
  // CSRF: origin moet overeenkomen met host
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 403 });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  const { password } = await req.json();

  const subdomain = req.headers.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);

  // Gebruik altijd dezelfde foutmelding om gebruikersenumeratie te voorkomen
  if (!restaurant || password !== restaurant.password) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  // Reset teller bij succesvolle login
  loginAttempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("menu_admin", String(restaurant.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("menu_admin");
  return res;
}

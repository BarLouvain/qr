import { NextRequest, NextResponse } from "next/server";

function parseSubdomain(hostname: string): string {
  const host = hostname.split(":")[0]; // strip port
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host)
  ) {
    return process.env.RESTAURANT_SUBDOMAIN ?? "";
  }
  const parts = host.split(".");
  // e.g. karement.menuflow.be -> parts[0] = "karement"
  // skip "www"
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }
  return "";
}

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const subdomain = parseSubdomain(hostname);

  // Forward subdomain to all API routes and pages via request header
  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-subdomain", subdomain);
  }

  const { pathname } = req.nextUrl;

  // Protect all /admin routes — cookie stores restaurantId
  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get("menu_admin");
    if (!cookie?.value) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};

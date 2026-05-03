import { NextRequest, NextResponse } from "next/server";
import { getRestaurantFromSubdomain } from "@/lib/restaurant";

export async function GET(req: NextRequest) {
  const subdomain = req.headers.get("x-subdomain");
  const restaurant = await getRestaurantFromSubdomain(subdomain);

  if (!restaurant) {
    return NextResponse.json(null, { status: 404 });
  }

  const { password: _pw, ...public_data } = restaurant;
  return NextResponse.json(public_data);
}

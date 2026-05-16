import { NextRequest, NextResponse } from "next/server";
import { fetchGA4Traffic, type GA4Period } from "@/lib/ga4";

const VALID_PERIODS = new Set<GA4Period>(["7d", "30d", "quarter", "year"]);

export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get("period") ?? "30d") as GA4Period;
  if (!VALID_PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const path = req.nextUrl.searchParams.get("path") ?? undefined;
  const data = await fetchGA4Traffic(period, path);

  if (!data) {
    // Env vars not configured — tell the client to use mock data
    return NextResponse.json(
      { error: "GA4 not configured", configured: false },
      { status: 503 },
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

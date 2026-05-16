/**
 * GA4 Data API — server-side client.
 * Uses Node.js built-in `crypto` for RS256 JWT signing.
 * No extra packages required.
 *
 * Required env vars (set in Vercel + .env.local):
 *   GA4_PROPERTY_ID            — numeric property ID (without "properties/")
 *   GOOGLE_SERVICE_ACCOUNT_JSON — full service account JSON as a single-line string
 */

import { createSign } from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceAccount {
  client_email: string;
  private_key:  string;
}

interface GA4ReportRow {
  dimensionValues?: { value: string }[];
  metricValues?:    { value: string }[];
}

interface GA4ReportResponse {
  rows?:         GA4ReportRow[];
  rowCount?:     number;
  error?:        { message: string; code: number };
}

export interface ChannelData {
  name:    string;  // English label
  nameEs:  string;  // Spanish label
  value:   number;  // percentage 0-100
  color:   string;  // hex
  sessions: number; // raw count
}

export interface PageData {
  path:     string;
  title:    string;
  views:    number;
  sessions: number;
}

export interface GA4TrafficData {
  channels:        ChannelData[];
  topPages:        PageData[];
  activeUsers:     number;
  totalSessions:   number;
  totalPageViews?: number;
  fromCache:       boolean;
}

// ─── Token cache (module-level, reused across requests in the same process) ───

let _tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (_tokenCache && _tokenCache.exp > now + 60) return _tokenCache.token;

  const header  = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss:   sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  };

  const enc    = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const input  = `${enc(header)}.${enc(payload)}`;
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  const sig = signer.sign(sa.private_key, "base64url");
  const jwt = `${input}.${sig}`;

  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  jwt,
    }),
  });
  const data = await res.json() as { access_token: string; expires_in: number };
  if (!data.access_token) throw new Error(`GA4 auth failed: ${JSON.stringify(data)}`);

  _tokenCache = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

// ─── Report runner ────────────────────────────────────────────────────────────

async function runReport(
  propertyId: string,
  token:      string,
  body:       object,
): Promise<GA4ReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  return res.json() as Promise<GA4ReportResponse>;
}

// ─── Channel mapping ──────────────────────────────────────────────────────────
// GA4 default channel groupings → our 4 display buckets

const CHANNEL_MAP: Record<string, { name: string; nameEs: string; color: string }> = {
  organic:  { name: "Organic",  nameEs: "Orgánico",  color: "#C8102E" },
  direct:   { name: "Direct",   nameEs: "Directo",   color: "#1a1a1a" },
  social:   { name: "Social",   nameEs: "Redes",     color: "#888780" },
  referral: { name: "Referral", nameEs: "Referidos", color: "#D3D1C7" },
};

function mapChannelKey(ga4Channel: string): keyof typeof CHANNEL_MAP {
  const c = ga4Channel.toLowerCase();
  if (c.includes("organic") && !c.includes("social")) return "organic";
  if (c === "direct") return "direct";
  if (c.includes("social") || c.includes("display")) return "social";
  return "referral"; // email, paid, referral, unassigned → referral bucket
}

// ─── Response cache (1 h per period) ─────────────────────────────────────────

const _dataCache = new Map<string, { data: GA4TrafficData; ts: number }>();
const CACHE_TTL  = 3_600_000; // 1 hour

// ─── Public API ───────────────────────────────────────────────────────────────

export type GA4Period = "7d" | "30d" | "quarter" | "year";

const PERIOD_DATE: Record<GA4Period, string> = {
  "7d":      "7daysAgo",
  "30d":     "30daysAgo",
  "quarter": "90daysAgo",
  "year":    "365daysAgo",
};

/** Fetches real traffic data from GA4. Returns null if env vars missing.
 *  Pass `pathPrefix` (e.g. "/the-little-dominicana") to filter to a specific site section. */
export async function fetchGA4Traffic(
  period: GA4Period,
  pathPrefix?: string,
): Promise<GA4TrafficData | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const saJson     = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !saJson) return null;

  // Cache check
  const cacheKey = `traffic-${period}${pathPrefix ? `-${pathPrefix}` : ""}`;
  const cached   = _dataCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { ...cached.data, fromCache: true };
  }

  let sa: ServiceAccount;
  try {
    sa = JSON.parse(saJson) as ServiceAccount;
  } catch {
    console.error("GA4: invalid GOOGLE_SERVICE_ACCOUNT_JSON");
    return null;
  }

  const startDate = PERIOD_DATE[period];
  const token     = await getAccessToken(sa);

  // Optional path filter — narrows all reports to pages starting with this prefix
  const pathFilter = pathPrefix
    ? {
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "BEGINS_WITH", value: pathPrefix },
          },
        },
      }
    : {};

  // Run all reports in parallel
  const [channelReport, pageReport, userReport] = await Promise.all([
    runReport(propertyId, token, {
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGrouping" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
      ...pathFilter,
    }),
    runReport(propertyId, token, {
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics:    [{ name: "screenPageViews" }, { name: "sessions" }],
      orderBys:   [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit:      10,
      ...pathFilter,
    }),
    runReport(propertyId, token, {
      dateRanges: [{ startDate, endDate: "today" }],
      metrics:    [{ name: "activeUsers" }, { name: "screenPageViews" }],
      ...pathFilter,
    }),
  ]);

  // Parse channels
  const buckets: Record<string, number> = { organic: 0, direct: 0, social: 0, referral: 0 };
  for (const row of channelReport.rows ?? []) {
    const key = mapChannelKey(row.dimensionValues?.[0]?.value ?? "");
    buckets[key] += parseInt(row.metricValues?.[0]?.value ?? "0", 10);
  }
  const totalSessions = Object.values(buckets).reduce((a, b) => a + b, 0);
  const channels: ChannelData[] = Object.entries(buckets)
    .filter(([, sessions]) => sessions > 0)
    .map(([key, sessions]) => ({
      ...CHANNEL_MAP[key],
      sessions,
      value: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // Normalise percentages to exactly 100 (rounding fix)
  const sum = channels.reduce((a, c) => a + c.value, 0);
  if (channels.length > 0 && sum !== 100) channels[0].value += 100 - sum;

  // Parse top pages
  const topPages: PageData[] = (pageReport.rows ?? []).map(row => ({
    path:     row.dimensionValues?.[0]?.value ?? "/",
    title:    row.dimensionValues?.[1]?.value ?? "",
    views:    parseInt(row.metricValues?.[0]?.value ?? "0", 10),
    sessions: parseInt(row.metricValues?.[1]?.value ?? "0", 10),
  }));

  const activeUsers    = parseInt(userReport.rows?.[0]?.metricValues?.[0]?.value ?? "0", 10);
  const totalPageViews = parseInt(userReport.rows?.[0]?.metricValues?.[1]?.value ?? "0", 10);

  const result: GA4TrafficData = {
    channels,
    topPages,
    activeUsers,
    totalSessions,
    totalPageViews,
    fromCache: false,
  };

  _dataCache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

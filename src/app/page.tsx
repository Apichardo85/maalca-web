import HomeClient, { type FeaturedAffiliate } from "./HomeClient";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// The "Negocios que ya operan" section barely changes (a new featured affiliate is a rare,
// manual IsFeatured=true flip in the admin, not a per-visit event) — ISR instead of
// no-store keeps every homepage load from hitting maalca-api.
export const revalidate = 21600; // 6h

async function getFeaturedAffiliates(): Promise<FeaturedAffiliate[]> {
  try {
    // Explicit per-fetch revalidate, not just the segment export above — the homepage route
    // is already forced dynamic by something else in the tree (confirmed pre-existing, not
    // this fetch), so this is what actually keeps the data cached across requests.
    const res = await fetch(`${API}/api/public/affiliates/featured`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Page() {
  const featuredAffiliates = await getFeaturedAffiliates();
  return <HomeClient featuredAffiliates={featuredAffiliates} />;
}

// Server-side loader: fetches dishes from maalca-api, falls back to MOCK_DISHES if unavailable.
// Used by page.tsx / menu/page.tsx / gallery/page.tsx server wrappers.
import { MOCK_DISHES, type MenuItem } from './_data'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'
const AFFILIATE_SLUG = 'the-little-dominicana'

export async function getDishes(): Promise<MenuItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/public/affiliates/${AFFILIATE_SLUG}/catalog`,
      { next: { revalidate: 60, tags: ['affiliate:the-little-dominicana'] } },
    )
    if (!res.ok) {
      console.warn('[dishes-loader] API error:', res.status)
      return MOCK_DISHES
    }
    const data = await res.json()
    const items = data.items ?? []
    if (!items.length) {
      console.warn('[dishes-loader] no items from API, falling back')
      return MOCK_DISHES
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((item: any): MenuItem => ({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      image: item.imageUrl ?? item.image_url ?? '',
      category: item.category ?? 'General',
      flags: {},
      popular: false,
      available: true,
    }))
  } catch (err) {
    console.warn('[dishes-loader] exception, falling back:', err)
    return MOCK_DISHES
  }
}

// Server-side loader: Supabase primary → maalca-api fallback → MOCK_DISHES last resort.
// Supabase stays primary while the dashboard upload route still writes image_url there.
import { supabaseServer } from '@/lib/supabase/server'
import { MOCK_DISHES, type MenuItem } from './_data'
import type { MealPeriod, WeekDay } from '@/lib/types'

const AFFILIATE_ID = 'the-little-dominican'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'
const AFFILIATE_SLUG = 'the-little-dominicana'

interface DbDish {
  id: string
  affiliate_id: string
  name: string
  description: string | null
  description_en: string | null
  price: number | string
  category: string
  image_url: string | null
  periods: string[] | null
  week_days: string[] | null
  available: boolean
  featured: boolean
  popular: boolean
  flags: { vegetarian?: boolean; spicy?: boolean; glutenFree?: boolean } | null
  display_order: number
}

function mapDbToMenuItem(row: DbDish): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    descriptionEn: row.description_en ?? undefined,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    image: row.image_url ?? '',
    category: row.category,
    flags: row.flags ?? {},
    popular: row.popular,
    available: row.available,
    periods: (row.periods && row.periods.length > 0 ? row.periods : undefined) as MealPeriod[] | undefined,
    weekDays: (row.week_days && row.week_days.length > 0 ? row.week_days : undefined) as WeekDay[] | undefined,
  }
}

async function fromSupabase(): Promise<MenuItem[] | null> {
  try {
    const supabase = await supabaseServer()
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('affiliate_id', AFFILIATE_ID)
      .order('display_order', { ascending: true })

    if (error || !data?.length) {
      console.warn('[dishes-loader] Supabase miss:', error?.message ?? 'no rows')
      return null
    }
    return (data as DbDish[]).map(mapDbToMenuItem)
  } catch (err) {
    console.warn('[dishes-loader] Supabase exception:', err)
    return null
  }
}

async function fromApi(): Promise<MenuItem[] | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/public/affiliates/${AFFILIATE_SLUG}/catalog`,
      { next: { revalidate: 60, tags: ['affiliate:the-little-dominicana'] } },
    )
    if (!res.ok) {
      console.warn('[dishes-loader] maalca-api error:', res.status)
      return null
    }
    const data = await res.json()
    const items: unknown[] = data.items ?? []
    if (!items.length) return null
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
    console.warn('[dishes-loader] maalca-api exception:', err)
    return null
  }
}

export async function getDishes(): Promise<MenuItem[]> {
  return (await fromSupabase()) ?? (await fromApi()) ?? MOCK_DISHES
}

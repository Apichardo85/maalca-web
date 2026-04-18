// Server-side loader: fetches dishes from Supabase, falls back to MOCK_DISHES if unavailable.
// Used by page.tsx / menu/page.tsx / gallery/page.tsx server wrappers.
import { supabaseServer } from '@/lib/supabase/server'
import { MOCK_DISHES, type MenuItem } from './_data'
import type { MealPeriod } from '@/lib/types'

const AFFILIATE_ID = 'the-little-dominican'

interface DbDish {
  id: string
  affiliate_id: string
  name: string
  description: string | null
  price: number | string
  category: string
  image_url: string | null
  periods: string[] | null
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
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    image: row.image_url ?? '',
    category: row.category,
    flags: row.flags ?? {},
    popular: row.popular,
    available: row.available,
    periods: (row.periods && row.periods.length > 0 ? row.periods : undefined) as MealPeriod[] | undefined,
  }
}

export async function getDishes(): Promise<MenuItem[]> {
  try {
    const supabase = await supabaseServer()
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('affiliate_id', AFFILIATE_ID)
      .order('display_order', { ascending: true })

    if (error || !data?.length) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dishes-loader] falling back to MOCK_DISHES:', error?.message ?? 'no rows')
      }
      return MOCK_DISHES
    }
    return (data as DbDish[]).map(mapDbToMenuItem)
  } catch (err) {
    console.warn('[dishes-loader] exception, falling back:', err)
    return MOCK_DISHES
  }
}

// src/lib/slug.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function generateUniqueSlug(
  supabase: SupabaseClient,
  baseName: string
): Promise<string> {
  const base = slugify(baseName) || 'mi-negocio';
  let candidate = base;
  let suffix = 1;

  while (suffix < 100) {
    const [reserved, existing] = await Promise.all([
      supabase.from('reserved_slugs').select('slug').eq('slug', candidate).maybeSingle(),
      supabase.from('businesses').select('id').eq('slug', candidate).maybeSingle(),
    ]);

    if (!reserved.data && !existing.data) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

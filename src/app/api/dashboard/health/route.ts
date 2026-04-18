// GET /api/dashboard/health
// Diagnostic endpoint. Returns what's configured vs missing.
// Useful in production when the dashboard editor silently fails:
// visit https://…/api/dashboard/health to see exactly what's broken.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

type Check = { name: string; ok: boolean; detail?: string }

export async function GET(_req: NextRequest) {
  const checks: Check[] = []

  // 1. Env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  checks.push({
    name: 'env.NEXT_PUBLIC_SUPABASE_URL',
    ok: Boolean(url),
    detail: url ? `set (${url.slice(0, 40)}…)` : 'MISSING',
  })
  checks.push({
    name: 'env.SUPABASE_SERVICE_ROLE_KEY',
    ok: Boolean(serviceKey),
    detail: serviceKey ? `set (length ${serviceKey.length})` : 'MISSING — cannot write to DB or upload images',
  })
  checks.push({
    name: 'env.NEXT_PUBLIC_API_BASE_URL',
    ok: true,
    detail: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'not set (using mock auth fallback)',
  })

  // 2. Cookies
  const cookieStore = await cookies()
  const guid = cookieStore.get('affiliate_guid')?.value
  const role = cookieStore.get('user_role')?.value
  const token = cookieStore.get('auth_token')?.value
  checks.push({
    name: 'cookie.affiliate_guid',
    ok: Boolean(guid),
    detail: guid ? `present (${guid.slice(0, 13)}…)` : 'MISSING — user not logged in or cookie expired',
  })
  checks.push({
    name: 'cookie.user_role',
    ok: Boolean(role),
    detail: role ?? 'MISSING',
  })
  checks.push({
    name: 'cookie.auth_token',
    ok: Boolean(token),
    detail: token ? 'present' : 'MISSING',
  })

  // 3. Supabase reachable + dishes table accessible
  if (url && serviceKey) {
    try {
      const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { count, error } = await supabase
        .from('dishes')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', 'the-little-dominican')
      checks.push({
        name: 'db.dishes (TLD count)',
        ok: !error,
        detail: error ? `ERROR: ${error.message}` : `${count ?? 0} rows`,
      })

      // Check storage bucket
      const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets()
      const tldBucket = buckets?.find((b) => b.id === 'tld-photos')
      checks.push({
        name: 'storage.tld-photos',
        ok: Boolean(tldBucket) && !bucketErr,
        detail: bucketErr ? `ERROR: ${bucketErr.message}` : tldBucket ? `public=${tldBucket.public}` : 'bucket not found',
      })
    } catch (err) {
      checks.push({
        name: 'db.connection',
        ok: false,
        detail: `EXCEPTION: ${err instanceof Error ? err.message : String(err)}`,
      })
    }
  } else {
    checks.push({
      name: 'db.connection',
      ok: false,
      detail: 'skipped — env vars missing',
    })
  }

  const allOk = checks.every((c) => c.ok)
  return NextResponse.json(
    {
      ok: allOk,
      summary: allOk ? 'all green' : 'some checks failed — see below',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  )
}

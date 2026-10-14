#!/usr/bin/env node
/**
 * Optimiza UNA VEZ las fotos que ya estaban subidas a Storage (bucket `affiliate-media`) antes de
 * que existiera la compresión al subir (src/lib/optimize-image.ts). Ver docs/performance/board-media.md
 *
 * Qué hace: baja cada imagen > 200 KB, la reduce (máx 1600 px; comerciales en /ads/ a 1920 px) y la
 * re-guarda como WebP calidad 80 EN LA MISMA RUTA (la URL no cambia, no hay que tocar la base de datos).
 * Antes de sobrescribir copia el original a `_backup-originals/<ruta>` por si hay que revertir.
 * Solo reemplaza si el resultado es al menos 20 % más liviano.
 *
 * Uso (desde la raíz de maalca-web). Por defecto es SIMULACRO: no cambia nada, solo muestra el ahorro.
 *   node --env-file=.env.local scripts/optimize-existing-media.mjs
 *   node --env-file=.env.local scripts/optimize-existing-media.mjs --apply
 *
 * Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (ya están en .env.local).
 */
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET = 'affiliate-media';
const BACKUP_PREFIX = '_backup-originals';
const MIN_BYTES = 200 * 1024;
const MIN_SAVING = 0.2;
const APPLY = process.argv.includes('--apply');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Usa: node --env-file=.env.local scripts/optimize-existing-media.mjs');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const storage = supabase.storage.from(BUCKET);

async function walk(prefix = '') {
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list(prefix, { limit: 100, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) files.push(...(await walk(path))); // carpeta
      else files.push({ path, size: entry.metadata?.size ?? 0, mime: entry.metadata?.mimetype ?? '' });
    }
    if (data.length < 100) break;
  }
  return files;
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
const files = (await walk()).filter(
  (f) => !f.path.startsWith(BACKUP_PREFIX) && /^image\/(jpeg|png|webp)$/.test(f.mime) && f.size > MIN_BYTES,
);
console.log(`${APPLY ? 'APLICANDO' : 'SIMULACRO'} — ${files.length} imágenes mayores a ${kb(MIN_BYTES)}\n`);

let before = 0;
let after = 0;
let changed = 0;
for (const f of files) {
  const { data: blob, error } = await storage.download(f.path);
  if (error) { console.log(`  ! ${f.path}: no se pudo bajar (${error.message})`); continue; }
  const input = Buffer.from(await blob.arrayBuffer());
  const max = f.path.includes('/ads/') ? 1920 : 1600;
  let output;
  try {
    output = await sharp(input, { failOn: 'none' }).rotate()
      .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer();
  } catch (e) { console.log(`  ! ${f.path}: sharp falló (${e.message})`); continue; }

  if (output.length > input.length * (1 - MIN_SAVING)) { console.log(`  = ${f.path}: ${kb(input.length)} (sin mejora, se deja)`); continue; }
  before += input.length; after += output.length; changed += 1;
  console.log(`  ✓ ${f.path}: ${kb(input.length)} → ${kb(output.length)}`);

  if (!APPLY) continue;
  const backup = await storage.upload(`${BACKUP_PREFIX}/${f.path}`, input, { contentType: f.mime, upsert: true });
  if (backup.error) { console.log(`    ! backup falló, NO se sobrescribe (${backup.error.message})`); continue; }
  const up = await storage.upload(f.path, output, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
  if (up.error) console.log(`    ! no se pudo sobrescribir (${up.error.message})`);
}
console.log(`\n${changed} imágenes ${APPLY ? 'optimizadas' : 'optimizables'}: ${kb(before)} → ${kb(after)} (ahorro ${before ? Math.round((1 - after / before) * 100) : 0} %)`);
if (!APPLY) console.log('Es un simulacro. Para aplicar: agrega --apply');

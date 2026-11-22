// Trinquete de calidad: el repo ya trae errores de TypeScript y ESLint de antes (el build de
// Vercel los ignora con ignoreBuildErrors / ignoreDuringBuilds). En vez de exigir cero de golpe,
// el CI exige NO EMPEORAR: falla si aparece un error nuevo (archivo + código) o si un archivo
// suma más errores del mismo código que los que tenía en la línea base.
//
// Uso:
//   node scripts/ci/ratchet.mjs tsc    <salida-de-tsc.txt>     [--update]
//   node scripts/ci/ratchet.mjs eslint <salida-de-eslint.json> [--update]
// Con --update reescribe la línea base (.github/ci-baseline/<tipo>.txt). Hazlo solo cuando
// arreglas errores viejos, para que el trinquete baje y no vuelvan a entrar.
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const [kind, inputPath, flag] = process.argv.slice(2);
if (!['tsc', 'eslint'].includes(kind) || !inputPath) {
  console.error('Uso: node scripts/ci/ratchet.mjs <tsc|eslint> <archivo> [--update]');
  process.exit(2);
}
const root = resolve('.');
const baselinePath = `.github/ci-baseline/${kind}.txt`;

function countKeys(keys) {
  const m = new Map();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

function parseTsc(text) {
  const keys = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(.+?)\(\d+,\d+\): error (TS\d+):/);
    if (m) keys.push(`${m[1].replace(/\\/g, '/')}|${m[2]}`);
  }
  return keys;
}

function parseEslint(text) {
  const keys = [];
  const results = JSON.parse(text);
  for (const r of results) {
    const file = relative(root, r.filePath).replace(/\\/g, '/');
    for (const msg of r.messages) {
      if (msg.severity === 2) keys.push(`${file}|${msg.ruleId ?? 'parse-error'}`);
    }
  }
  return keys;
}

const raw = readFileSync(inputPath, 'utf8');
const current = countKeys(kind === 'tsc' ? parseTsc(raw) : parseEslint(raw));

function serialize(map) {
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `${n} ${k}`).join('\n') + '\n';
}

if (flag === '--update') {
  writeFileSync(baselinePath, serialize(current));
  console.log(`Línea base de ${kind} actualizada: ${[...current.values()].reduce((a, b) => a + b, 0)} errores.`);
  process.exit(0);
}

const baseline = new Map();
for (const line of readFileSync(baselinePath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^(\d+) (.+)$/);
  if (m) baseline.set(m[2], Number(m[1]));
}

const worse = [];
for (const [k, n] of current) {
  const before = baseline.get(k) ?? 0;
  if (n > before) worse.push(`${k} (${before} → ${n})`);
}
const better = [];
for (const [k, n] of baseline) {
  const now = current.get(k) ?? 0;
  if (now < n) better.push(`${k} (${n} → ${now})`);
}

const total = [...current.values()].reduce((a, b) => a + b, 0);
console.log(`${kind}: ${total} errores en total.`);
if (better.length) {
  console.log(`Mejoró (actualiza la línea base con --update para fijarlo):\n  ${better.join('\n  ')}`);
}
if (worse.length) {
  console.error(`Errores NUEVOS de ${kind} (el cambio empeora el código):\n  ${worse.join('\n  ')}`);
  process.exit(1);
}
console.log(`Sin errores nuevos de ${kind}.`);

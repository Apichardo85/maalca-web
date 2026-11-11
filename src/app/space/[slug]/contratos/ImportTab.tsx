'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { parseDelimited } from '@/lib/delimited';
import { type ImportResult, type ImportRowInput, readApiError } from '@/lib/receivables';

const MAX_ROWS = 2000;

type Field = keyof ImportRowInput;

const FIELDS: { key: Field; es: string; en: string; synonyms: string[] }[] = [
  { key: 'name', es: 'Nombre', en: 'Name', synonyms: ['nombre', 'cliente', 'name', 'razon social', 'razonsocial'] },
  { key: 'phone', es: 'Teléfono', en: 'Phone', synonyms: ['telefono', 'tel', 'celular', 'movil', 'phone', 'whatsapp'] },
  { key: 'email', es: 'Correo', en: 'Email', synonyms: ['correo', 'email', 'e-mail', 'mail'] },
  { key: 'rnc', es: 'RNC / Cédula', en: 'Tax ID', synonyms: ['rnc', 'cedula', 'documento', 'tax id'] },
  { key: 'address', es: 'Dirección', en: 'Address', synonyms: ['direccion', 'address', 'ubicacion', 'sector'] },
  { key: 'notes', es: 'Notas', en: 'Notes', synonyms: ['notas', 'nota', 'notes', 'observaciones', 'comentario'] },
  { key: 'billingCycle', es: 'Ciclo de cobro', en: 'Billing cycle', synonyms: ['ciclo', 'cobro', 'facturacion', 'billing'] },
  { key: 'deliveryFrequency', es: 'Frecuencia de entrega', en: 'Delivery frequency', synonyms: ['frecuencia', 'entrega', 'delivery'] },
  { key: 'creditDays', es: 'Días de crédito', en: 'Credit days', synonyms: ['credito', 'dias de credito', 'dias', 'credit'] },
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function ImportTab({ slug, onImported }: { slug: string; onImported?: () => void }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [raw, setRaw] = useState('');
  const [grid, setGrid] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, Field | ''>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);

  const header = grid[0] ?? [];
  const body = useMemo(() => grid.slice(1), [grid]);

  function load(text: string) {
    setResult(null);
    setRaw(text);
    const parsed = parseDelimited(text);
    setGrid(parsed);
    if (parsed.length === 0) {
      setMapping({});
      return;
    }
    const auto: Record<number, Field | ''> = {};
    const used = new Set<Field>();
    parsed[0].forEach((h, i) => {
      const n = norm(h);
      const match = FIELDS.find((f) => !used.has(f.key) && f.synonyms.some((s) => n === s || n.includes(s)));
      if (match) {
        auto[i] = match.key;
        used.add(match.key);
      } else {
        auto[i] = '';
      }
    });
    setMapping(auto);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    load(await file.text());
    e.target.value = '';
  }

  function buildRows(): ImportRowInput[] {
    return body.map((cells) => {
      const row: ImportRowInput = {
        name: null, phone: null, email: null, rnc: null, address: null, notes: null,
        billingCycle: null, deliveryFrequency: null, creditDays: null,
      };
      Object.entries(mapping).forEach(([idx, field]) => {
        if (!field) return;
        const v = (cells[Number(idx)] ?? '').trim();
        if (v === '') return;
        if (field === 'creditDays') {
          const n = parseInt(v.replace(/\D/g, ''), 10);
          row.creditDays = Number.isFinite(n) ? n : null;
        } else {
          row[field] = v;
        }
      });
      return row;
    });
  }

  const nameMapped = Object.values(mapping).includes('name');
  const tooMany = body.length > MAX_ROWS;

  async function run(dryRun: boolean) {
    if (!nameMapped) {
      toast.error(getText('Indica cuál columna es el nombre.', 'Pick which column is the name.'));
      return;
    }
    if (tooMany) {
      toast.error(getText(`Máximo ${MAX_ROWS} filas por importación.`, `Max ${MAX_ROWS} rows per import.`));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/space/${slug}/customers/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: buildRows(), dryRun }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo procesar el archivo.', "Couldn't process the file.")));
        return;
      }
      const data: ImportResult = await res.json();
      setResult(data);
      if (!dryRun) {
        toast.success(getText(`${data.imported} clientes importados.`, `${data.imported} customers imported.`));
        setGrid([]);
        setRaw('');
        onImported?.();
      }
    } catch {
      toast.error(getText('No se pudo procesar el archivo.', "Couldn't process the file."));
    } finally {
      setBusy(false);
    }
  }

  const input = 'rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm';

  return (
    <div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        {getText(
          'Pega las celdas desde Excel o sube un archivo CSV. La primera fila debe tener los nombres de las columnas.',
          'Paste cells from Excel or upload a CSV file. The first row must contain the column names.',
        )}
      </p>

      <textarea
        rows={6}
        value={raw}
        onChange={(e) => load(e.target.value)}
        placeholder={getText('Pega aquí…', 'Paste here…')}
        className="mt-3 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 font-mono text-xs"
      />
      <input type="file" accept=".csv,.tsv,.txt,text/csv" onChange={onFile} className="mt-2 block text-sm" />

      {grid.length > 1 && (
        <div className="mt-5">
          <p className="text-sm font-semibold">
            {body.length} {getText('filas', 'rows')}
            {tooMany && <span className="ml-2 text-red-600 dark:text-red-400">{getText(`(máximo ${MAX_ROWS})`, `(max ${MAX_ROWS})`)}</span>}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {header.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-neutral-800 px-3 py-2">
                <span className="min-w-0 break-words text-sm">{h || `#${i + 1}`}</span>
                <select
                  className={input}
                  value={mapping[i] ?? ''}
                  onChange={(e) => setMapping({ ...mapping, [i]: e.target.value as Field | '' })}
                >
                  <option value="">{getText('— ignorar —', '— ignore —')}</option>
                  {FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>{getText(f.es, f.en)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
            {getText('Si no asignas una columna a "Ciclo de cobro", esos clientes se facturan cada mes; los días de crédito vacíos se toman como contado.', 'If no column is mapped to "Billing cycle", those customers are billed monthly; empty credit days mean cash.')}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => run(true)}
              disabled={busy}
              className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {busy ? getText('Procesando…', 'Processing…') : getText('Validar', 'Validate')}
            </button>
            {result?.dryRun && result.new > 0 && (
              <button
                type="button"
                onClick={() => run(false)}
                disabled={busy}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
              >
                {getText(`Importar ${result.new} nuevos`, `Import ${result.new} new`)}
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-5">
          <p className="text-sm">
            {result.dryRun ? getText('Validación: ', 'Validation: ') : getText('Importación: ', 'Import: ')}
            <strong>{result.new}</strong> {getText('nuevos', 'new')} · <strong>{result.duplicates}</strong> {getText('duplicados', 'duplicates')} · <strong>{result.invalid}</strong> {getText('inválidos', 'invalid')}
          </p>
          {result.rows.some((r) => r.status !== 'new') && (
            <ul className="mt-2 max-h-64 divide-y divide-gray-200 dark:divide-neutral-800 overflow-auto rounded-xl border border-gray-200 dark:border-neutral-800">
              {result.rows
                .filter((r) => r.status !== 'new')
                .map((r) => (
                  <li key={r.row} className="px-3 py-2 text-xs">
                    <span className="font-semibold">#{r.row}</span> {r.name ?? '—'} —{' '}
                    <span className={r.status === 'invalid' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-neutral-400'}>
                      {r.status === 'invalid' ? getText('Inválido', 'Invalid') : getText('Duplicado', 'Duplicate')}
                      {r.reason ? `: ${r.reason}` : ''}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

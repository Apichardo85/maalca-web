'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { IMPACT_LABELS, IMPACT_STYLES, apiErrorMessage, type ImpactLevel } from '@/lib/support/types';

export interface ChangeField { field: string; before: string | null; after: string | null }
export interface ChangeRecord {
  id: string;
  entityType: string;
  entityLabelEs: string;
  entityLabelEn: string;
  entityId: string;
  entityName: string | null;
  operation: 'added' | 'modified' | 'deleted';
  fields: ChangeField[];
  impactLevel: ImpactLevel;
  surfacesEs: string[];
  surfacesEn: string[];
  noteEs: string | null;
  noteEn: string | null;
}
export interface ChangeSet {
  id: string;
  affiliateId: string;
  createdAt: string;
  actorEmail: string | null;
  actorKind: 'owner' | 'team' | 'support' | 'system';
  supportTicketId: string | null;
  supportTicketNumber: number | null;
  revertOfChangeSetId: string | null;
  revertedAt: string | null;
  revertedBy: string | null;
  impactLevel: ImpactLevel;
  records: ChangeRecord[];
}
interface RevertResult { reverted: boolean; applied: number; conflicts: string[]; changeSet: ChangeSet }

/** Nombres legibles de los campos más comunes; el resto se muestra con su nombre técnico. */
const FIELD_LABELS: Record<string, { es: string; en: string }> = {
  Name: { es: 'Nombre', en: 'Name' },
  NameEn: { es: 'Nombre (EN)', en: 'Name (EN)' },
  Description: { es: 'Descripción', en: 'Description' },
  DescriptionEn: { es: 'Descripción (EN)', en: 'Description (EN)' },
  Price: { es: 'Precio', en: 'Price' },
  CompareAtPrice: { es: 'Precio anterior', en: 'Compare-at price' },
  Category: { es: 'Categoría', en: 'Category' },
  ImageUrl: { es: 'Imagen', en: 'Image' },
  IsActive: { es: 'Activo', en: 'Active' },
  Active: { es: 'Activo', en: 'Active' },
  Stock: { es: 'Existencia', en: 'Stock' },
  Logo: { es: 'Logo', en: 'Logo' },
  LogoUrl: { es: 'Logo', en: 'Logo' },
  PrimaryColor: { es: 'Color principal', en: 'Primary color' },
  SecondaryColor: { es: 'Color secundario', en: 'Secondary color' },
  AccentColor: { es: 'Color de acento', en: 'Accent color' },
  CoverImageUrl: { es: 'Portada', en: 'Cover' },
  Horario: { es: 'Horario', en: 'Hours' },
  WhatsApp: { es: 'WhatsApp', en: 'WhatsApp' },
  ContactEmail: { es: 'Correo', en: 'Email' },
  Address: { es: 'Dirección', en: 'Address' },
  Duration: { es: 'Duración', en: 'Duration' },
  SortOrder: { es: 'Orden', en: 'Order' },
};

const KIND_LABELS: Record<ChangeSet['actorKind'], { es: string; en: string }> = {
  owner: { es: 'Dueño', en: 'Owner' },
  team: { es: 'Equipo', en: 'Team' },
  support: { es: 'Soporte MaalCa', en: 'MaalCa support' },
  system: { es: 'Sistema', en: 'System' },
};

/** Valor JSON crudo → texto corto para mostrar. */
function show(raw: string | null, es: boolean): string {
  if (raw === null || raw === 'null') return '—';
  if (raw === 'true') return es ? 'Sí' : 'Yes';
  if (raw === 'false') return 'No';
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try { return JSON.parse(raw) as string || '—'; } catch { return raw; }
  }
  return raw;
}

/**
 * Lista de cambios de configuración (quién, cuándo, qué valor había antes y cuál quedó) con "Revertir".
 * revertUrl(id) arma el POST de reversión (/space o /ops). Si alguien cambió un campo después, la reversión
 * no lo pisa y se muestra como conflicto; se puede forzar.
 */
export function ChangeHistoryList({
  sets,
  revertUrl,
  canRevert,
  onReverted,
  showTicket = true,
}: {
  sets: ChangeSet[];
  revertUrl: (changeSetId: string) => string;
  canRevert: boolean;
  onReverted: () => void;
  showTicket?: boolean;
}) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);

  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; ok: boolean; text: string; conflicts: string[] } | null>(null);

  async function revert(id: string, force: boolean) {
    const msg = force
      ? getText('¿Forzar la reversión? Se pisarán los cambios hechos después.', 'Force the revert? Later changes will be overwritten.')
      : getText('¿Revertir este cambio? Los valores vuelven a como estaban antes.', 'Revert this change? Values go back to how they were.');
    if (!window.confirm(msg)) return;
    setBusy(id);
    setResult(null);
    try {
      const res = await fetch(revertUrl(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = (await res.json().catch(() => null)) as RevertResult | null;
      if (!res.ok || !data) {
        setResult({ id, ok: false, text: apiErrorMessage(data, getText('No se pudo revertir.', 'Could not revert.')), conflicts: [] });
        return;
      }
      setResult({
        id,
        ok: data.reverted,
        text: data.reverted
          ? getText(`Revertido (${data.applied} valor(es)).`, `Reverted (${data.applied} value(s)).`)
          : getText('No se revirtió nada.', 'Nothing was reverted.'),
        conflicts: data.conflicts,
      });
      if (data.reverted) onReverted();
    } finally {
      setBusy(null);
    }
  }

  if (sets.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">{getText('Sin cambios registrados.', 'No changes recorded.')}</p>;
  }

  const opLabel = (op: ChangeRecord['operation']) =>
    op === 'added' ? getText('Agregado', 'Added') : op === 'deleted' ? getText('Borrado', 'Deleted') : getText('Cambiado', 'Changed');

  return (
    <ol className="space-y-3">
      {sets.map((s) => (
        <li key={s.id} className={`rounded-xl border border-border bg-surface p-3 ${s.revertedAt ? 'opacity-70' : ''}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-xs text-text-secondary">
              <span className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${IMPACT_STYLES[s.impactLevel ?? 'green']}`}>
                {IMPACT_LABELS[s.impactLevel ?? 'green'][es ? 'es' : 'en']}
              </span>
              <span className="font-medium text-text-primary">{KIND_LABELS[s.actorKind][es ? 'es' : 'en']}</span>
              {s.actorEmail ? ` · ${s.actorEmail}` : ''} · {new Date(s.createdAt).toLocaleString(es ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {showTicket && s.supportTicketNumber !== null && ` · ${getText('solicitud', 'request')} #${s.supportTicketNumber}`}
              {s.revertOfChangeSetId && ` · ${getText('reversión', 'revert')}`}
            </p>
            {s.revertedAt ? (
              <span className="text-xs text-text-muted">{getText('Revertido', 'Reverted')}{s.revertedBy ? ` · ${s.revertedBy}` : ''}</span>
            ) : canRevert ? (
              <button type="button" disabled={busy !== null} onClick={() => revert(s.id, false)} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-primary hover:border-brand-primary disabled:opacity-50">
                {busy === s.id ? '…' : getText('Revertir', 'Revert')}
              </button>
            ) : null}
          </div>

          <ul className="mt-2 space-y-2">
            {s.records.map((r) => (
              <li key={r.id} className="text-sm">
                <p className="text-text-primary">
                  <span className="font-medium">{es ? r.entityLabelEs : r.entityLabelEn}</span>
                  {r.entityName ? `: ${r.entityName}` : ''} <span className="text-xs text-text-muted">({opLabel(r.operation)})</span>
                </p>
                {(r.surfacesEs?.length ?? 0) > 0 && (
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {getText('Se ve en', 'Shows in')}: {(es ? r.surfacesEs : r.surfacesEn).join(' · ')}
                    {(es ? r.noteEs : r.noteEn) && <span className="block">{es ? r.noteEs : r.noteEn}</span>}
                  </p>
                )}
                {r.operation === 'modified' && r.fields.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-3 text-xs text-text-secondary">
                    {r.fields.map((f) => (
                      <li key={f.field} className="break-words">
                        {FIELD_LABELS[f.field]?.[es ? 'es' : 'en'] ?? f.field}: <span className="line-through opacity-70">{show(f.before, es)}</span> → <span className="text-text-primary">{show(f.after, es)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {result?.id === s.id && (
            <div className={`mt-2 rounded-lg p-2 text-xs ${result.ok ? 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300' : 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300'}`}>
              <p>{result.text}</p>
              {result.conflicts.length > 0 && (
                <>
                  <ul className="mt-1 list-disc pl-4">{result.conflicts.map((c, i) => <li key={i}>{c}</li>)}</ul>
                  {!result.ok && canRevert && (
                    <button type="button" onClick={() => revert(s.id, true)} className="mt-1 font-semibold underline">
                      {getText('Forzar reversión', 'Force revert')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

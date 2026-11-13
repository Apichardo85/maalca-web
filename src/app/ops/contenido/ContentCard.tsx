'use client';

import { useState } from 'react';
import { NETWORK_LABEL, STATUS_LABEL, type ContentItem } from './types';

const INPUT =
  'w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs';
const BTN = 'rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50';
const VERDICT: Record<string, { label: string; cls: string }> = {
  pass: { label: 'Revisor: pasa', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  warn: { label: 'Revisor: aviso', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  fail: { label: 'Revisor: fallo', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};
const STATUS_CLS: Record<ContentItem['status'], string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300',
  changes_requested: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

interface Props {
  item: ContentItem;
  onChange: (updated: ContentItem) => void;
  onError: (message: string | null) => void;
  onNotice: (message: string | null) => void;
}

export function ContentCard({ item, onChange, onError, onNotice }: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    date: item.scheduledFor.slice(0, 10), title: item.title, caption: item.caption, hashtags: item.hashtags ?? '',
    mediaBrief: item.mediaBrief ?? '', mediaUrl: item.mediaUrl ?? '', mediaKind: item.mediaKind,
  });
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_changes' | null>(null);
  const [note, setNote] = useState('');

  const open = item.status === 'draft' || item.status === 'changes_requested' || item.status === 'approved';

  async function call(path: string, method: 'PUT' | 'POST', body: unknown): Promise<ContentItem | null> {
    setBusy(true);
    onError(null);
    onNotice(null);
    try {
      const res = await fetch(`/api/ops/content/${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      return data as ContentItem;
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Algo salió mal.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const updated = await call(item.id, 'PUT', {
      date: draft.date, title: draft.title, caption: draft.caption, hashtags: draft.hashtags,
      mediaBrief: draft.mediaBrief, mediaUrl: draft.mediaUrl, mediaKind: draft.mediaKind,
    });
    if (updated) {
      onChange(updated);
      setEditing(false);
      onNotice('Pieza guardada. Si cambiaste el texto, vuelve a borrador y necesita nueva revisión.');
    }
  }

  async function decide(kind: 'approve' | 'reject' | 'request_changes') {
    const updated = await call(`${item.id}/decision`, 'POST', { decision: kind, note: note.trim() || null });
    if (updated) {
      onChange(updated);
      setDecision(null);
      setNote('');
    }
  }

  async function upload(file: File) {
    setBusy(true);
    onError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('affiliateId', item.affiliateId);
      const res = await fetch('/api/ops/content-media', { method: 'POST', body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo subir el archivo.');
      setDraft((d) => ({ ...d, mediaUrl: data.url, mediaKind: data.kind }));
      onNotice('Archivo subido. Pulsa Guardar para dejarlo en la pieza.');
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  const verdict = item.reviewVerdict ? VERDICT[item.reviewVerdict] : null;
  const media = editing ? draft.mediaUrl : item.mediaUrl;
  const kind = editing ? draft.mediaKind : item.mediaKind;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-semibold text-brand-primary">{NETWORK_LABEL[item.network]}</span>
        <span className="text-gray-500 dark:text-neutral-400">{new Date(item.scheduledFor).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>
        {item.occasion && <span className="text-gray-400">· {item.occasion}</span>}
        <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_CLS[item.status]}`}>{STATUS_LABEL[item.status]}</span>
        {verdict && <span className={`rounded-full px-2 py-0.5 font-medium ${verdict.cls}`}>{verdict.label}</span>}
        <span className="text-gray-400">{item.source === 'agent' ? 'IA' : 'Manual'}</span>
        <span className="ml-auto text-gray-400">{item.affiliateName}</span>
      </div>

      {!editing ? (
        <div className="mt-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-neutral-100">{item.title}</p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-700 dark:text-neutral-300">{item.caption}</p>
          {item.hashtags && <p className="mt-1 text-xs text-brand-primary">{item.hashtags}</p>}
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={`${INPUT} w-40`} />
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={INPUT} placeholder="Título" />
          </div>
          <textarea rows={6} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className={INPUT} />
          <input value={draft.hashtags} onChange={(e) => setDraft({ ...draft, hashtags: e.target.value })} className={INPUT} placeholder="#hashtags" />
        </div>
      )}

      {/* Medio */}
      <div className="mt-3 rounded-lg bg-gray-50 dark:bg-neutral-950 p-3 text-xs">
        <p className="font-medium text-gray-500 dark:text-neutral-400">
          Medio: {kind === 'none' ? 'sin imagen ni video' : kind === 'image' ? 'imagen' : 'video'}
        </p>
        {(editing ? draft.mediaBrief : item.mediaBrief) && !editing && (
          <p className="mt-1 text-gray-600 dark:text-neutral-300">Qué hace falta: {item.mediaBrief}</p>
        )}
        {media && kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media} alt="" className="mt-2 max-h-48 rounded-md" />
        )}
        {media && kind === 'video' && <video src={media} controls className="mt-2 max-h-48 rounded-md" />}
        {editing && (
          <div className="mt-2 space-y-2">
            <textarea rows={2} value={draft.mediaBrief} onChange={(e) => setDraft({ ...draft, mediaBrief: e.target.value })} className={INPUT} placeholder="Qué imagen o video hace falta" />
            <div className="flex flex-wrap items-center gap-2">
              <select value={draft.mediaKind} onChange={(e) => setDraft({ ...draft, mediaKind: e.target.value as ContentItem['mediaKind'] })} className={`${INPUT} w-32`}>
                <option value="none">Sin medio</option>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" disabled={busy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} className="text-xs" />
            </div>
            <input value={draft.mediaUrl} onChange={(e) => setDraft({ ...draft, mediaUrl: e.target.value })} className={INPUT}
              placeholder="…o pega el enlace del archivo (para videos de más de 4 MB)" />
          </div>
        )}
      </div>

      {item.reviewNotes && (
        <p className="mt-2 text-xs text-gray-600 dark:text-neutral-400"><span className="font-medium">Notas del revisor:</span> {item.reviewNotes}</p>
      )}
      {item.staffNote && (
        <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400"><span className="font-medium">Nota de {item.decidedBy ?? 'staff'}:</span> {item.staffNote}</p>
      )}

      {open && (
        <div className="mt-3 space-y-2">
          {decision && (
            <div className="flex flex-wrap gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} className={`${INPUT} flex-1`}
                placeholder={decision === 'reject' ? 'Motivo del rechazo' : decision === 'approve' ? 'El revisor marcó un fallo: ¿por qué la apruebas igual?' : 'Qué hay que cambiar'} />
              <button disabled={busy || !note.trim()} onClick={() => decide(decision)} className={`${BTN} bg-brand-primary text-white`}>Confirmar</button>
              <button disabled={busy} onClick={() => { setDecision(null); setNote(''); }} className={`${BTN} text-gray-500`}>Cancelar</button>
            </div>
          )}
          {!decision && (
            <div className="flex flex-wrap gap-2">
              {editing ? (
                <>
                  <button disabled={busy} onClick={save} className={`${BTN} bg-brand-primary text-white`}>Guardar</button>
                  <button disabled={busy} onClick={() => setEditing(false)} className={`${BTN} text-gray-500`}>Cancelar</button>
                </>
              ) : (
                <>
                  {item.status !== 'approved' && (
                    <button disabled={busy} onClick={() => (item.reviewVerdict === 'fail' ? setDecision('approve') : decide('approve'))}
                      className={`${BTN} bg-green-600 text-white`}>Aprobar</button>
                  )}
                  <button disabled={busy} onClick={() => setEditing(true)} className={`${BTN} border border-gray-300 dark:border-neutral-700`}>Editar / medio</button>
                  <button disabled={busy} onClick={() => setDecision('request_changes')} className={`${BTN} border border-amber-400 text-amber-700`}>Pedir cambios</button>
                  <button disabled={busy} onClick={() => setDecision('reject')} className={`${BTN} border border-red-300 text-red-600`}>Rechazar</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

// src/app/space/[slug]/readers/ReadersContent.tsx
// Club de lectores del autor: quién te lee (lista, estado, membresía, exportar), las cartas que les mandas y los
// ajustes (formulario de cartas en tu página, membresía mensual con Stripe). Ver ReaderClub.cs en maalca-api.
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export interface ReaderClubSettings {
  lettersEnabled: boolean;
  lettersPitch?: string | null;
  lettersPitchEn?: string | null;
  membershipEnabled: boolean;
  monthlyPrice?: number | null;
  currency: 'USD' | 'DOP';
  benefits?: string | null;
  benefitsEn?: string | null;
  paymentsReady: boolean;
}

export interface ReaderRow {
  id: string;
  email: string;
  name?: string | null;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  lettersOptIn: boolean;
  membershipStatus: string;
  isMember: boolean;
  membershipCurrentPeriodEnd?: string | null;
  source: string;
  sourceWorkId?: string | null;
  sourceWorkTitle?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface ReaderList {
  stats: { confirmed: number; pending: number; members: number; lettersOptIn: number; unsubscribed: number };
  items: ReaderRow[];
  total: number;
}

export interface ReaderLetter {
  id: string;
  subject: string;
  bodyHtml?: string | null;
  audience: 'all' | 'members';
  status: 'draft' | 'queued' | 'sending' | 'sent';
  queuedAt?: string | null;
  sentAt?: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

interface Props {
  slug: string;
  initialSettings: ReaderClubSettings | null;
  initialList: ReaderList | null;
  initialLetters: ReaderLetter[];
}

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400';
const cardClass = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 disabled:opacity-40';
const dangerBtn = 'rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-800 dark:text-red-400';

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`) };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

type Tab = 'readers' | 'letters' | 'settings';

export function ReadersContent({ slug, initialSettings, initialList, initialLetters }: Props) {
  const { language } = useSimpleLanguage();
  const lang: 'es' | 'en' = language === 'es' ? 'es' : 'en';
  const getText = (es: string, en: string) => (lang === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/readers`;
  const [tab, setTab] = useState<Tab>('readers');

  const fail = (res: { error?: string }, es: string, en: string) =>
    toast.error(res.error && res.error !== 'network' ? res.error : getText(es, en));

  const tabs: { id: Tab; label: string }[] = [
    { id: 'readers', label: getText('Lectores', 'Readers') },
    { id: 'letters', label: getText('Cartas', 'Letters') },
    { id: 'settings', label: getText('Ajustes', 'Settings') },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="mb-5">
        <h1 className="text-xl font-bold">{getText('Lectores', 'Readers')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Quién te lee, las cartas que les mandas por correo y la membresía mensual.',
            'Who reads you, the letters you email them and the monthly membership.',
          )}
        </p>
      </div>

      <div role="tablist" className="mb-5 flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition ${tab === t.id ? 'bg-white shadow-sm dark:bg-neutral-900' : 'text-gray-500 dark:text-neutral-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'readers' && <ReadersTab base={base} initial={initialList} getText={getText} lang={lang} toast={toast} fail={fail} />}
      {tab === 'letters' && <LettersTab base={base} initial={initialLetters} stats={initialList?.stats ?? null} getText={getText} lang={lang} toast={toast} fail={fail} />}
      {tab === 'settings' && <SettingsTab slug={slug} base={base} initial={initialSettings} getText={getText} toast={toast} fail={fail} />}
    </div>
  );
}

type Toaster = ReturnType<typeof useToast>;
type Fail = (res: { error?: string }, es: string, en: string) => void;

// ── Lectores ───────────────────────────────────────────────────────────────────

function ReadersTab({ base, initial, getText, lang, toast, fail }: { base: string; initial: ReaderList | null; getText: (es: string, en: string) => string; lang: 'es' | 'en'; toast: Toaster; fail: Fail }) {
  const [list, setList] = useState<ReaderList | null>(initial);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function load(nextFilter = filter, nextQ = q, skip = 0) {
    setLoading(true);
    const params = new URLSearchParams({ filter: nextFilter, take: '50', skip: String(skip) });
    if (nextQ.trim()) params.set('q', nextQ.trim());
    const res = await api<ReaderList>(`${base}?${params}`);
    setLoading(false);
    if (!res.ok || !res.data) return fail(res, 'No pudimos cargar los lectores.', "We couldn't load the readers.");
    setList(skip === 0 || !list ? res.data : { ...res.data, items: [...list.items, ...res.data.items] });
  }

  async function remove(id: string) {
    const res = await api(`${base}/${id}`, { method: 'DELETE' });
    setConfirmId(null);
    if (!res.ok) return fail(res, 'No se pudo borrar.', 'Could not delete.');
    toast.success(getText('Lector borrado.', 'Reader deleted.'));
    await load();
  }

  const stats = list?.stats;
  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US') : '—');
  const filters = [
    { id: 'all', es: 'Todos', en: 'All' },
    { id: 'confirmed', es: 'Confirmados', en: 'Confirmed' },
    { id: 'members', es: 'Miembros', en: 'Members' },
    { id: 'pending', es: 'Sin confirmar', en: 'Unconfirmed' },
    { id: 'unsubscribed', es: 'De baja', en: 'Unsubscribed' },
  ];

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: stats.confirmed, l: getText('confirmados', 'confirmed') },
            { n: stats.lettersOptIn, l: getText('reciben cartas', 'get letters') },
            { n: stats.members, l: getText('miembros', 'members') },
            { n: stats.pending, l: getText('sin confirmar', 'unconfirmed') },
          ].map((s) => (
            <div key={s.l} className={cardClass}>
              <div className="text-2xl font-bold">{s.n}</div>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select className={`${inputClass} w-auto`} value={filter} onChange={(e) => { setFilter(e.target.value); void load(e.target.value, q); }}>
          {filters.map((f) => <option key={f.id} value={f.id}>{f[lang]}</option>)}
        </select>
        <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); void load(filter, q); }}>
          <input className={inputClass} placeholder={getText('Buscar por correo o nombre', 'Search by email or name')} value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className={secondaryBtn} disabled={loading}>{getText('Buscar', 'Search')}</button>
        </form>
        <a href={`${base}/export`} className={secondaryBtn}>{getText('Exportar CSV', 'Export CSV')}</a>
      </div>

      {!list || list.items.length === 0 ? (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Todavía no hay lectores aquí. Llegan desde el formulario de las cartas en tu página.', 'No readers here yet. They arrive from the letters form on your page.')}
        </div>
      ) : (
        <ul className={`${cardClass} divide-y divide-gray-100 p-0 dark:divide-neutral-800`}>
          {list.items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{r.email}</div>
                <div className="text-xs text-gray-500 dark:text-neutral-400">
                  {[r.name, r.sourceWorkTitle ? `${getText('desde', 'from')} ${r.sourceWorkTitle}` : null, `${getText('alta', 'joined')} ${fmt(r.createdAt)}`].filter(Boolean).join(' · ')}
                </div>
              </div>
              {r.isMember && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{getText('miembro', 'member')}</span>}
              <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                {r.status === 'confirmed' ? (r.lettersOptIn ? getText('recibe cartas', 'gets letters') : getText('sin cartas', 'no letters')) : r.status === 'pending' ? getText('sin confirmar', 'unconfirmed') : getText('de baja', 'unsubscribed')}
              </span>
              {confirmId === r.id ? (
                <span className="flex gap-1">
                  <button type="button" className={dangerBtn} onClick={() => remove(r.id)}>{getText('Borrar', 'Delete')}</button>
                  <button type="button" className="px-2 text-xs text-gray-500" onClick={() => setConfirmId(null)}>{getText('No', 'No')}</button>
                </span>
              ) : (
                <button type="button" aria-label={getText('Borrar lector', 'Delete reader')} className="px-2 text-gray-400 hover:text-red-500" onClick={() => setConfirmId(r.id)}>✕</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {list && list.items.length < list.total && (
        <button type="button" className={secondaryBtn} disabled={loading} onClick={() => load(filter, q, list.items.length)}>
          {getText('Ver más', 'Load more')} ({list.total - list.items.length})
        </button>
      )}
    </div>
  );
}

// ── Cartas ─────────────────────────────────────────────────────────────────────

function LettersTab({ base, initial, stats, getText, lang, toast, fail }: { base: string; initial: ReaderLetter[]; stats: ReaderList['stats'] | null; getText: (es: string, en: string) => string; lang: 'es' | 'en'; toast: Toaster; fail: Fail }) {
  const [letters, setLetters] = useState<ReaderLetter[]>(initial);
  const [open, setOpen] = useState<{ id: string | null; subject: string; body: string; audience: 'all' | 'members' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);

  async function reload() {
    const res = await api<ReaderLetter[]>(`${base}/letters`);
    if (res.ok && res.data) setLetters(res.data);
  }

  async function save(): Promise<string | null> {
    if (!open) return null;
    if (!open.subject.trim()) {
      toast.error(getText('La carta necesita un asunto.', 'The letter needs a subject.'));
      return null;
    }
    setSaving(true);
    const body = JSON.stringify({ subject: open.subject.trim(), bodyHtml: open.body || null, audience: open.audience });
    const res = open.id
      ? await api<ReaderLetter>(`${base}/letters/${open.id}`, { method: 'PUT', body })
      : await api<ReaderLetter>(`${base}/letters`, { method: 'POST', body });
    setSaving(false);
    if (!res.ok || !res.data) {
      fail(res, 'No se pudo guardar la carta.', 'Could not save the letter.');
      return null;
    }
    setOpen((o) => (o ? { ...o, id: res.data!.id } : o));
    await reload();
    return res.data.id;
  }

  async function test() {
    const id = await save();
    if (!id) return;
    const res = await api(`${base}/letters/${id}/test`, { method: 'POST', body: JSON.stringify({ email: testEmail.trim() || null }) });
    if (!res.ok) return fail(res, 'No se pudo mandar la prueba.', 'Could not send the test.');
    toast.success(getText('Prueba enviada.', 'Test sent.'));
  }

  async function send() {
    const id = await save();
    if (!id) return;
    const res = await api<ReaderLetter>(`${base}/letters/${id}/send`, { method: 'POST' });
    setConfirmSend(false);
    if (!res.ok) return fail(res, 'No se pudo enviar.', 'Could not send.');
    toast.success(getText('La carta está saliendo. Puedes cerrar esta página.', 'The letter is going out. You can close this page.'));
    setOpen(null);
    await reload();
  }

  async function remove(id: string) {
    const res = await api(`${base}/letters/${id}`, { method: 'DELETE' });
    if (!res.ok) return fail(res, 'No se pudo borrar.', 'Could not delete.');
    await reload();
  }

  const audienceCount = (a: 'all' | 'members') => (stats ? (a === 'members' ? stats.members : stats.lettersOptIn) : null);
  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString(lang === 'es' ? 'es-DO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '');
  const statusLabel: Record<ReaderLetter['status'], string> = {
    draft: getText('Borrador', 'Draft'),
    queued: getText('En cola', 'Queued'),
    sending: getText('Saliendo', 'Sending'),
    sent: getText('Enviada', 'Sent'),
  };

  if (open) {
    const count = audienceCount(open.audience);
    return (
      <div className={`${cardClass} space-y-3`}>
        <button type="button" onClick={() => setOpen(null)} className="text-sm text-gray-500">← {getText('Cartas', 'Letters')}</button>
        <div>
          <label className={labelClass}>{getText('Asunto', 'Subject')}</label>
          <input className={inputClass} value={open.subject} maxLength={200} onChange={(e) => setOpen({ ...open, subject: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>{getText('Para', 'To')}</label>
          <select className={inputClass} value={open.audience} onChange={(e) => setOpen({ ...open, audience: e.target.value as 'all' | 'members' })}>
            <option value="all">{getText('Todos los que reciben cartas', 'Everyone who gets letters')}{audienceCount('all') != null ? ` (${audienceCount('all')})` : ''}</option>
            <option value="members">{getText('Solo miembros', 'Members only')}{audienceCount('members') != null ? ` (${audienceCount('members')})` : ''}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{getText('Carta', 'Letter')}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700 [&_.ProseMirror]:min-h-[260px]">
            <RichTextEditor value={open.body} onChange={(html) => setOpen((o) => (o ? { ...o, body: html } : o))} getText={getText} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <label className={labelClass}>{getText('Correo para la prueba (vacío = tu correo de contacto)', 'Test email (empty = your contact email)')}</label>
            <input className={inputClass} type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
          </div>
          <button type="button" className={secondaryBtn} onClick={test} disabled={saving}>{getText('Mandar prueba', 'Send test')}</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button type="button" className={secondaryBtn} onClick={() => save().then((id) => id && toast.success(getText('Borrador guardado.', 'Draft saved.')))} disabled={saving}>
            {getText('Guardar borrador', 'Save draft')}
          </button>
          {confirmSend ? (
            <span className="flex flex-wrap items-center gap-2 text-sm">
              {getText(`¿Enviar a ${count ?? '…'} lectores? No se puede deshacer.`, `Send to ${count ?? '…'} readers? This can't be undone.`)}
              <button type="button" className={primaryBtn} onClick={send} disabled={saving}>{getText('Sí, enviar', 'Yes, send')}</button>
              <button type="button" className="text-gray-500" onClick={() => setConfirmSend(false)}>{getText('No', 'No')}</button>
            </span>
          ) : (
            <button type="button" className={primaryBtn} onClick={() => setConfirmSend(true)} disabled={saving || !open.body}>{getText('Enviar', 'Send')}</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button type="button" className={`${primaryBtn} min-h-11`} onClick={() => setOpen({ id: null, subject: '', body: '', audience: 'all' })}>
          {getText('+ Nueva carta', '+ New letter')}
        </button>
      </div>
      {letters.length === 0 ? (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>{getText('Todavía no has escrito cartas.', "You haven't written any letters yet.")}</div>
      ) : (
        <ul className="space-y-2">
          {letters.map((l) => (
            <li key={l.id} className={`${cardClass} flex flex-wrap items-center gap-3`}>
              <button
                type="button"
                disabled={l.status !== 'draft'}
                onClick={() => setOpen({ id: l.id, subject: l.subject, body: l.bodyHtml ?? '', audience: l.audience })}
                className="min-w-0 flex-1 text-left disabled:cursor-default"
              >
                <div className="truncate font-medium">{l.subject}</div>
                <div className="text-xs text-gray-500 dark:text-neutral-400">
                  {l.status === 'draft'
                    ? `${getText('editada', 'edited')} ${fmt(l.updatedAt ?? l.createdAt)}`
                    : `${l.sentCount}/${l.recipientCount} ${getText('enviadas', 'sent')}${l.failedCount ? ` · ${l.failedCount} ${getText('fallaron', 'failed')}` : ''}${l.sentAt ? ` · ${fmt(l.sentAt)}` : ''}`}
                  {l.audience === 'members' ? ` · ${getText('solo miembros', 'members only')}` : ''}
                </div>
              </button>
              <span className={`rounded-full px-2 py-0.5 text-xs ${l.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : l.status === 'draft' ? 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                {statusLabel[l.status]}
              </span>
              {(l.status === 'draft' || l.status === 'sent') && (
                <button type="button" aria-label={getText('Borrar carta', 'Delete letter')} className="px-2 text-gray-400 hover:text-red-500" onClick={() => remove(l.id)}>✕</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Ajustes ────────────────────────────────────────────────────────────────────

function SettingsTab({ slug, base, initial, getText, toast, fail }: { slug: string; base: string; initial: ReaderClubSettings | null; getText: (es: string, en: string) => string; toast: Toaster; fail: Fail }) {
  const [s, setS] = useState<ReaderClubSettings>(
    initial ?? { lettersEnabled: true, membershipEnabled: false, currency: 'USD', paymentsReady: false },
  );
  const [price, setPrice] = useState(initial?.monthlyPrice != null ? String(initial.monthlyPrice) : '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await api<ReaderClubSettings>(`${base}/settings`, {
      method: 'PUT',
      body: JSON.stringify({
        lettersEnabled: s.lettersEnabled,
        lettersPitch: s.lettersPitch?.trim() || null,
        lettersPitchEn: s.lettersPitchEn?.trim() || null,
        membershipEnabled: s.membershipEnabled,
        monthlyPrice: price.trim() ? Number(price) : null,
        currency: s.currency,
        benefits: s.benefits || null,
        benefitsEn: s.benefitsEn || null,
      }),
    });
    setSaving(false);
    if (!res.ok || !res.data) return fail(res, 'No se pudieron guardar los ajustes.', 'Could not save the settings.');
    setS(res.data);
    toast.success(getText('Ajustes guardados.', 'Settings saved.'));
  }

  return (
    <div className="space-y-4">
      <section className={`${cardClass} space-y-3`}>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={s.lettersEnabled} onChange={(e) => setS({ ...s, lettersEnabled: e.target.checked })} />
          {getText('Formulario de las cartas en mi página', 'Letters signup form on my page')}
        </label>
        <div>
          <label className={labelClass}>{getText('Qué recibe quien se suscribe y cada cuánto', 'What subscribers get and how often')}</label>
          <textarea className={inputClass} rows={2} maxLength={600} value={s.lettersPitch ?? ''} onChange={(e) => setS({ ...s, lettersPitch: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>{getText('Lo mismo en inglés (opcional)', 'Same in English (optional)')}</label>
          <textarea className={inputClass} rows={2} maxLength={600} value={s.lettersPitchEn ?? ''} onChange={(e) => setS({ ...s, lettersPitchEn: e.target.value })} />
        </div>
      </section>

      <section className={`${cardClass} space-y-3`}>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={s.membershipEnabled} onChange={(e) => setS({ ...s, membershipEnabled: e.target.checked })} />
          {getText('Membresía mensual', 'Monthly membership')}
        </label>
        {!s.paymentsReady && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {getText('Para cobrar la membresía primero conecta tus pagos con Stripe en ', 'To charge for the membership, first connect your payments with Stripe in ')}
            <a href={`/space/${slug}/settings`} className="underline">{getText('Configuración', 'Settings')}</a>
            {getText('. Mientras tanto no se muestra en tu página.', '. Until then it is not shown on your page.')}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{getText('Precio al mes', 'Price per month')}</label>
            <input className={inputClass} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))} placeholder="5.00" />
          </div>
          <div>
            <label className={labelClass}>{getText('Moneda', 'Currency')}</label>
            <select className={inputClass} value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value as 'USD' | 'DOP' })}>
              <option value="USD">USD</option>
              <option value="DOP">DOP</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Si cambias el precio, los miembros actuales siguen con el suyo; el nuevo aplica a quien entre después.',
            'If you change the price, current members keep theirs; the new one applies to whoever joins next.',
          )}
        </p>
        <div>
          <label className={labelClass}>{getText('Qué incluye', "What's included")}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700">
            <RichTextEditor value={s.benefits ?? ''} onChange={(html) => setS((x) => ({ ...x, benefits: html }))} getText={getText} />
          </div>
        </div>
        <div>
          <label className={labelClass}>{getText('Lo mismo en inglés (opcional)', 'Same in English (optional)')}</label>
          <div className="rounded-lg border border-gray-300 dark:border-neutral-700">
            <RichTextEditor value={s.benefitsEn ?? ''} onChange={(html) => setS((x) => ({ ...x, benefitsEn: html }))} getText={getText} />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Las obras en acceso "Miembros" se abren completas para ellos (se configura en cada obra).',
            'Works set to "Members" open in full for them (set it on each work).',
          )}
        </p>
      </section>

      <button type="button" className={`${primaryBtn} min-h-11`} onClick={save} disabled={saving}>
        {saving ? getText('Guardando…', 'Saving…') : getText('Guardar ajustes', 'Save settings')}
      </button>
    </div>
  );
}

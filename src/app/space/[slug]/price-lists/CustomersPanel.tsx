'use client';

// Clientes del negocio y en qué lista de precios está cada uno. Distinto del panel de Miembros de arriba: allí están
// las cuentas que se registraron solas en la tienda; acá está tu cartera completa (la que importaste o creaste tú),
// que es la que reparte el camión. Asignar una lista acá le cambia el precio a ese cliente en la hoja de ruta, sin
// tener que teclear el precio uno por uno en su contrato.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PriceListRow } from './PriceListsContent';

export interface PriceListCustomerRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  priceListId: string | null;
  priceListName: string | null;
}

interface Props {
  slug: string;
  lists: PriceListRow[];
  getText: (es: string, en: string) => string;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const NO_LIST = 'none';
const PAGE = 200;

export function CustomersPanel({ slug, lists, getText, onError, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PriceListCustomerRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  // El buscador dispara una consulta por tecla si no se espera: se deja pasar un momento sin escribir.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/price-lists/customer-counts`);
      if (!res.ok) return;
      const data: { priceListId: string | null; count: number }[] = await res.json();
      setCounts(Object.fromEntries(data.map((c) => [c.priceListId ?? NO_LIST, c.count])));
    } catch {
      // Sin contadores el panel sigue sirviendo: solo no se ven los números en las pestañas.
    }
  }, [slug]);

  const loadRows = useCallback(
    async (listFilter: string, term: string) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ take: String(PAGE) });
        // "Sin lista" no se puede pedir al API por listId: se filtra acá sobre el total.
        if (listFilter !== 'all' && listFilter !== NO_LIST) qs.set('listId', listFilter);
        if (term.trim()) qs.set('q', term.trim());
        const res = await fetch(`/api/space/${slug}/price-lists/customers?${qs}`);
        if (!res.ok) throw new Error();
        const data: PriceListCustomerRow[] = await res.json();
        setRows(listFilter === NO_LIST ? data.filter((c) => !c.priceListId) : data);
      } catch {
        onError(getText('No se pudieron cargar los clientes.', "Couldn't load customers."));
      } finally {
        setLoading(false);
      }
    },
    [slug, getText, onError],
  );

  useEffect(() => {
    if (!open) return;
    loadCounts();
  }, [open, loadCounts]);

  useEffect(() => {
    if (!open) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => loadRows(filter, search), search ? 350 : 0);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [open, filter, search, loadRows]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function apply(assign: boolean) {
    // Al quitar no hace falta elegir lista: se usa la del cliente, que es la que se despega.
    const listId = assign ? target : null;
    if (assign && !listId) {
      onError(getText('Elige a qué lista los vas a pasar.', 'Pick which list to move them to.'));
      return;
    }
    const ids = [...selected];
    if (ids.length === 0) return;

    setBusy(true);
    try {
      if (assign) {
        const res = await fetch(`/api/space/${slug}/price-lists/${listId}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerIds: ids, assign: true }),
        });
        if (!res.ok) throw new Error();
      } else {
        // Quitar va por lista: cada cliente se despega de la suya.
        const byList = new Map<string, string[]>();
        for (const id of ids) {
          const row = rows.find((r) => r.id === id);
          if (!row?.priceListId) continue;
          byList.set(row.priceListId, [...(byList.get(row.priceListId) ?? []), id]);
        }
        if (byList.size === 0) {
          onError(getText('Esos clientes ya están a precio público.', 'Those customers are already at public price.'));
          setBusy(false);
          return;
        }
        for (const [list, customerIds] of byList) {
          const res = await fetch(`/api/space/${slug}/price-lists/${list}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds, assign: false }),
          });
          if (!res.ok) throw new Error();
        }
      }
      onSuccess(
        assign
          ? getText(`${ids.length} cliente(s) pasaron a esa lista.`, `${ids.length} customer(s) moved to that list.`)
          : getText(`${ids.length} cliente(s) quedaron a precio público.`, `${ids.length} customer(s) back to public price.`),
      );
      setSelected(new Set());
      await Promise.all([loadCounts(), loadRows(filter, search)]);
    } catch {
      onError(getText('No se pudo guardar el cambio.', "Couldn't save the change."));
    } finally {
      setBusy(false);
    }
  }

  const chip = (value: string, label: string, count: number | undefined) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        setFilter(value);
        setSelected(new Set());
      }}
      className={`min-h-9 rounded-full border px-3 text-xs font-medium ${
        filter === value
          ? 'border-brand-primary bg-brand-primary text-white'
          : 'border-border text-text-secondary hover:border-brand-primary'
      }`}
    >
      {label}
      {count !== undefined && <span className="ml-1 opacity-80">{count}</span>}
    </button>
  );

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-text-primary">{getText('Clientes y su lista', 'Customers and their list')}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {getText(
              'Tu cartera completa. El precio que le asignes acá es el que el camión le cobra, salvo que su contrato tenga un precio pactado, que siempre manda.',
              'Your full customer base. The list you set here is what the truck charges, unless their contract has an agreed price, which always wins.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-h-9 shrink-0 rounded-full border border-border px-3 text-xs font-medium text-text-primary hover:border-brand-primary"
        >
          {open ? getText('Ocultar', 'Hide') : getText('Ver clientes', 'View customers')}
        </button>
      </div>

      {open && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {chip('all', getText('Todos', 'All'), total || undefined)}
            {lists.map((l) => chip(l.id, l.name, counts[l.id] ?? 0))}
            {chip(NO_LIST, getText('Precio público', 'Public price'), counts[NO_LIST] ?? 0)}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={getText('Buscar por nombre o teléfono…', 'Search by name or phone…')}
            className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
          />

          {selected.size > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-brand-primary/40 bg-surface-elevated p-3">
              <span className="text-sm text-text-primary">
                {getText(`${selected.size} seleccionado(s)`, `${selected.size} selected`)}
              </span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="min-h-9 rounded-lg border border-border bg-surface px-2 text-sm text-text-primary"
              >
                <option value="">{getText('Pasar a la lista…', 'Move to list…')}</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => apply(true)}
                disabled={busy}
                className="min-h-9 rounded-lg bg-brand-primary px-3 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
              >
                {busy ? getText('Guardando…', 'Saving…') : getText('Aplicar', 'Apply')}
              </button>
              <button
                type="button"
                onClick={() => apply(false)}
                disabled={busy}
                className="min-h-9 rounded-lg border border-border px-3 text-sm text-text-primary hover:border-brand-primary disabled:opacity-50"
              >
                {getText('Quitar lista', 'Remove list')}
              </button>
            </div>
          )}

          <div className="mt-3 max-h-[480px] overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-elevated text-xs text-text-muted">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && selected.size === rows.length}
                      onChange={toggleAll}
                      aria-label={getText('Seleccionar todos', 'Select all')}
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium">{getText('Cliente', 'Customer')}</th>
                  <th className="px-3 py-2 text-left font-medium">{getText('Lista', 'List')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-xs text-text-muted">
                      {getText('Cargando…', 'Loading…')}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-xs text-text-muted">
                      {search
                        ? getText('Ningún cliente con ese nombre o teléfono.', 'No customer with that name or phone.')
                        : getText('Todavía no tienes clientes registrados.', 'No customers yet.')}
                    </td>
                  </tr>
                ) : (
                  rows.map((c) => (
                    <tr key={c.id} className="border-t border-border-muted">
                      <td className="px-3 py-2 align-top">
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} aria-label={c.name} />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-text-primary">{c.name}</p>
                        <p className="text-xs text-text-muted">
                          {[c.phone, c.address].filter(Boolean).join(' · ') || getText('Sin contacto', 'No contact')}
                        </p>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {c.priceListName ? (
                          <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                            {c.priceListName}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">{getText('Precio público', 'Public price')}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rows.length === PAGE && (
            <p className="mt-2 text-xs text-text-muted">
              {getText(
                `Se muestran los primeros ${PAGE}. Usa el buscador para llegar a uno en concreto.`,
                `Showing the first ${PAGE}. Use the search box to reach a specific one.`,
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}

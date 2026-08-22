'use client';

import { useState } from 'react';

export interface PoncheMember {
  id: string;
  name: string;
  photoUrl: string | null;
}

interface Props {
  slug: string;
  businessName: string;
  logoUrl: string | null;
  initialTeam: PoncheMember[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const BRAND = '#C8102E';

type View = 'picker' | 'pin' | 'result';

export function PoncheContent({ slug, businessName, logoUrl, initialTeam }: Props) {
  const [team] = useState(initialTeam);
  const [view, setView] = useState<View>('picker');
  const [selected, setSelected] = useState<PoncheMember | null>(null);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ action: string; hours: number | null } | null>(null);

  function selectMember(member: PoncheMember) {
    setSelected(member);
    setPin('');
    setError(null);
    setView('pin');
  }

  function backToPicker() {
    setSelected(null);
    setPin('');
    setError(null);
    setView('picker');
  }

  function pressDigit(d: string) {
    if (saving || pin.length >= 6) return;
    setPin((prev) => prev + d);
  }

  function backspace() {
    setPin((prev) => prev.slice(0, -1));
  }

  async function submitPin() {
    if (!selected || pin.length < 4 || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/ponche/${selected.id}/clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'No se pudo poncher.');
      }
      setResult({ action: data.action, hours: data.hoursThisShift ?? null });
      setView('result');
      setTimeout(() => {
        setResult(null);
        backToPicker();
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo poncher.');
      setPin('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-6 py-10">
      <div className="w-full max-w-md text-center mb-8">
        {logoUrl && <img src={logoUrl} alt={businessName} className="mx-auto mb-3 h-14 w-14 rounded-full object-cover" />}
        <h1 className="text-lg font-bold">{businessName}</h1>
        <p className="text-sm text-neutral-400">Reloj de entrada/salida</p>
      </div>

      {view === 'picker' && (
        <div className="w-full max-w-md">
          {team.length === 0 ? (
            <p className="text-center text-sm text-neutral-500">
              Ningún empleado tiene PIN configurado todavía. Pídele al dueño que te asigne uno desde el panel de Equipo.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {team.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMember(m)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600"
                >
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                      style={{ backgroundColor: BRAND }}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium truncate max-w-full">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'pin' && selected && (
        <div className="w-full max-w-xs text-center">
          <p className="mb-4 text-sm text-neutral-400">Hola, {selected.name} — escribe tu PIN</p>
          <div className="mb-4 flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full border border-neutral-600"
                style={{ backgroundColor: i < pin.length ? BRAND : 'transparent' }}
              />
            ))}
          </div>
          {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pressDigit(d)}
                disabled={saving}
                className="rounded-xl bg-neutral-900 border border-neutral-800 py-4 text-xl font-semibold disabled:opacity-40"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={backToPicker}
              disabled={saving}
              className="rounded-xl bg-neutral-900 border border-neutral-800 py-4 text-xs font-semibold text-neutral-400 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => pressDigit('0')}
              disabled={saving}
              className="rounded-xl bg-neutral-900 border border-neutral-800 py-4 text-xl font-semibold disabled:opacity-40"
            >
              0
            </button>
            <button
              type="button"
              onClick={backspace}
              disabled={saving}
              className="rounded-xl bg-neutral-900 border border-neutral-800 py-4 text-xs font-semibold text-neutral-400 disabled:opacity-40"
            >
              ⌫
            </button>
          </div>
          <button
            type="button"
            onClick={submitPin}
            disabled={pin.length < 4 || saving}
            className="mt-4 w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: BRAND }}
          >
            {saving ? 'Ponchando…' : 'Poncher'}
          </button>
        </div>
      )}

      {view === 'result' && selected && result && (
        <div className="w-full max-w-xs text-center">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-2xl mb-2">{result.action === 'ClockedIn' ? '👋' : '✅'}</p>
            <p className="text-base font-semibold">
              {result.action === 'ClockedIn' ? `¡Bienvenido, ${selected.name}!` : `¡Hasta luego, ${selected.name}!`}
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              {result.action === 'ClockedIn'
                ? 'Entrada registrada.'
                : `Salida registrada${result.hours != null ? ` — ${result.hours}h trabajadas` : ''}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

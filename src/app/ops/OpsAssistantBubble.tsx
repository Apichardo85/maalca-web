'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '¿Qué negocios están en riesgo de churn?',
  '¿Cuál es nuestro MRR y cómo va comparado al mes pasado?',
  'Redactame un email de seguimiento para un negocio sin conectar pagos',
];

/** Asistente flotante — persiste (abierto/cerrado, historial) mientras el usuario navega entre
 *  /ops, /ops/negocios, /ops/negocios/[id] y /ops/equipo porque vive en OpsShell (el layout),
 *  no en cada página. */
export function OpsAssistantBubble() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ops/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? 'El asistente no pudo responder.');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-80 sm:w-96 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Asistente</h2>
              <p className="text-xs text-gray-400 dark:text-neutral-500">Preguntale por negocios, riesgos, MRR.</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-3">
            {messages.length === 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-gray-200 dark:border-neutral-700 px-3 py-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:border-gray-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-72 space-y-3 overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'ml-auto bg-[#C8102E] text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="max-w-[85%] rounded-xl bg-gray-100 dark:bg-neutral-800 px-3 py-2 text-sm text-gray-400 dark:text-neutral-500">
                  Pensando…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Preguntale algo…"
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full bg-[#C8102E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C8102E] text-white shadow-lg hover:opacity-90"
        aria-label="Asistente"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}

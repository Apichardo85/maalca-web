import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Asistente IA interno de /ops. La lógica vive en maalca-api (orquestador de agentes): ficha del
 * agente "ops-assistant", modelo, llave, herramientas, pausa y costo se configuran en /ops/agentes.
 * Este route solo reenvía la conversación con el token del usuario; el API valida que sea admin.
 */
export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Faltan mensajes.' } }, { status: 400 });
  }

  try {
    const apiRes = await fetch(`${API}/api/ops/agents/ops-assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ messages: messages.map((m) => ({ role: m.role, content: m.content })) }),
      cache: 'no-store',
    });
    const data = await apiRes.json().catch(() => null);
    if (!apiRes.ok) {
      return NextResponse.json(
        data ?? { error: { code: 'UPSTREAM_ERROR', message: 'El asistente no pudo responder.' } },
        { status: apiRes.status },
      );
    }
    return NextResponse.json({ reply: data?.reply ?? '' });
  } catch (err) {
    console.error('[Ops Assistant] fetch failed:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'El asistente no pudo responder.' } },
      { status: 502 },
    );
  }
}

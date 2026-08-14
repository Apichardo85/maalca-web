import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { ANTHROPIC_MESSAGES_URL } from '@/lib/config/content-pipeline-config';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const MODEL = process.env.OPS_ANTHROPIC_MODEL || process.env.CONTENT_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Asistente IA interno de /ops. No usa RAG ni tool-calling — el set de afiliados de MaalCa es
 * chico, así que en cada turno le mandamos a Claude un snapshot fresco de overview+afiliados
 * como contexto de sistema. Si esto crece a cientos de negocios, esta estrategia deja de ser
 * viable y hay que pasar a herramientas reales (búsqueda, function calling).
 */
export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: 'NOT_CONFIGURED', message: 'ANTHROPIC_API_KEY no está configurada en este entorno.' } },
      { status: 503 },
    );
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: { code: 'INVALID_REQUEST', message: 'Faltan mensajes.' } }, { status: 400 });
  }

  // El check de admin real ya lo hace maalca-api (platform_admin claim) — si estas dos
  // llamadas fallan con 403, este usuario no es admin y no debe poder gastar tokens de Claude.
  const [overviewRes, affiliatesRes] = await Promise.all([
    fetch(`${API}/api/ops/overview`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/api/ops/affiliates`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ]);

  if (!overviewRes.ok || !affiliatesRes.ok) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'No autorizado.' } }, { status: 403 });
  }

  const overview = await overviewRes.json();
  const affiliates = await affiliatesRes.json();

  const systemPrompt = `Eres el asistente interno del panel de operaciones de MaalCa, un ecosistema de negocios (Espacio) que da a pequeños negocios su página web, catálogo, pedidos y pagos.

Hablás en español, tono directo y práctico — como un analista que ya conoce el negocio, no un chatbot genérico. No inventes datos: si algo no está en el contexto de abajo, decilo.

Contexto actual (JSON, generado en este momento):

Overview:
${JSON.stringify(overview, null, 2)}

Negocios (afiliados):
${JSON.stringify(affiliates, null, 2)}

Cuando te pregunten por "riesgo de churn", priorizá negocios en plan Emprendedor con alertas activas (sin conectar pagos, sin pedidos en 30 días) y poca actividad reciente. Cuando te pidan redactar algo (email, mensaje), hacelo directamente, listo para copiar.`;

  try {
    const anthropicRes = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text().catch(() => '');
      console.error('[Ops Assistant] Anthropic error:', anthropicRes.status, errText);
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: 'El asistente no pudo responder.' } },
        { status: 502 },
      );
    }

    const data = await anthropicRes.json();
    const reply = data?.content?.[0]?.text ?? '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[Ops Assistant] fetch failed:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'El asistente no pudo responder.' } },
      { status: 502 },
    );
  }
}

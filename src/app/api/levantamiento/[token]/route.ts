import { NextRequest, NextResponse } from 'next/server';
import { sendIntakeSubmittedEmail } from '@/lib/services/resend-service';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Autoguardado y envío del formulario público /levantamiento/[token]. Pasa por aquí (y no directo
// al API) para firmar con X-Internal-Secret: así maalca-api devuelve a quién avisar sin exponer el
// correo del admin al navegador del prospecto, y el aviso sale desde la web como el resto de correos.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: 'JSON no válido.' } }, { status: 400 });
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  const apiRes = await fetch(`${API}/api/public/intakes/${token}/answers`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': process.env.INTERNAL_NOTIFICATIONS_SECRET ?? '',
      ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await apiRes.json().catch(() => null);

  if (apiRes.ok && data?.notify?.to) {
    // Falla abierta: si el correo no sale, el envío ya quedó guardado y se ve en /ops.
    await sendIntakeSubmittedEmail({
      to: data.notify.to,
      businessName: data.notify.businessName,
      contactName: data.notify.contactName,
      intakeId: data.notify.id,
      answeredCount: data.answeredCount ?? 0,
      questionCount: data.questionCount ?? 0,
    }).catch(() => false);
  }

  if (data && typeof data === 'object') delete (data as { notify?: unknown }).notify;
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

import { NextRequest, NextResponse } from 'next/server';
import { sendProposalEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/invoice: maalca-api (C#) llama acá cuando se
 * marca una propuesta como "Sent" y el cliente tiene email guardado, para reusar la
 * infraestructura de Resend de maalca-web en vez de duplicarla en el backend .NET. Protegido
 * por el mismo secreto compartido.
 */
interface ProposalNotificationBody {
  customerEmail: string;
  customerName?: string | null;
  businessName: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  expiresAt?: string | null;
  proposalLink: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }

  const provided = request.headers.get('x-internal-secret') || '';
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ProposalNotificationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.customerEmail || !body.title || !body.proposalLink) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendProposalEmail({
    customerEmail: body.customerEmail,
    customerName: body.customerName ?? null,
    businessName: body.businessName,
    title: body.title,
    description: body.description ?? null,
    amount: body.amount,
    currency: body.currency,
    expiresAt: body.expiresAt ?? null,
    proposalLink: body.proposalLink,
  });

  return NextResponse.json({ sent });
}

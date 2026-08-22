import { NextRequest, NextResponse } from 'next/server';
import { sendProposalAcceptedEmail } from '@/lib/services/resend-service';

/**
 * Mismo patrón que /api/internal/notifications/proposal: maalca-api (C#) llama acá cuando un
 * cliente acepta/firma una propuesta, para avisarle al NEGOCIO (no al cliente). Ver
 * ProposalService.AcceptPublicProposalAsync + ProposalNotificationService.NotifyProposalAcceptedAsync.
 */
interface ProposalAcceptedBody {
  businessEmail: string;
  businessName: string;
  title: string;
  amount: number;
  currency: string;
  acceptedByName?: string | null;
  acceptedAt?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
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

  let body: ProposalAcceptedBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessEmail || !body.title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sent = await sendProposalAcceptedEmail({
    businessEmail: body.businessEmail,
    businessName: body.businessName,
    title: body.title,
    amount: body.amount,
    currency: body.currency,
    acceptedByName: body.acceptedByName ?? null,
    acceptedAt: body.acceptedAt ?? null,
    customerEmail: body.customerEmail ?? null,
    customerPhone: body.customerPhone ?? null,
  });

  return NextResponse.json({ sent });
}

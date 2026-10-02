import { NextRequest, NextResponse } from 'next/server';
import { sendCommunitySignupEmail } from '@/lib/services/resend-service';

/**
 * maalca-api (C#) llama acá cuando entra una inscripción pública de Comunidad (voluntario o evento,
 * ver CommunitySignupNotificationService). Avisa al negocio y le escribe a la persona. Protegido por
 * el mismo secreto compartido que el resto de /api/internal/notifications.
 */
interface CommunitySignupBody {
  signupKind: 'volunteer' | 'event';
  language?: string | null;
  businessName: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  timezone?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  partySize?: number;
  notes?: string | null;
  targetTitle: string;
  eventStartsAt?: string | null;
  eventEndsAt?: string | null;
  eventLocation?: string | null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.INTERNAL_NOTIFICATIONS_SECRET || '';
  if (!secret) {
    return NextResponse.json({ error: 'INTERNAL_NOTIFICATIONS_SECRET not configured' }, { status: 503 });
  }
  if ((request.headers.get('x-internal-secret') || '') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CommunitySignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessName || !body.name || !body.targetTitle || (body.signupKind !== 'volunteer' && body.signupKind !== 'event')) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.businessEmail && !body.email) {
    return NextResponse.json({ error: 'No recipients' }, { status: 400 });
  }

  const sent = await sendCommunitySignupEmail({
    signupKind: body.signupKind,
    language: body.language === 'en' ? 'en' : 'es',
    businessName: body.businessName,
    businessEmail: body.businessEmail ?? null,
    businessPhone: body.businessPhone ?? null,
    slug: body.slug ?? null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
    name: body.name,
    phone: body.phone ?? null,
    email: body.email ?? null,
    partySize: body.partySize ?? 1,
    notes: body.notes ?? null,
    targetTitle: body.targetTitle,
    eventStartsAt: body.eventStartsAt ?? null,
    eventEndsAt: body.eventEndsAt ?? null,
    eventLocation: body.eventLocation ?? null,
    timezone: body.timezone ?? null,
  });

  return NextResponse.json(sent);
}

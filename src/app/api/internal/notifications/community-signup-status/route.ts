import { NextRequest, NextResponse } from 'next/server';
import { sendCommunitySignupStatusEmail } from '@/lib/services/resend-service';

/**
 * maalca-api (C#) llama acá cuando el negocio confirma (voluntario) o cancela una inscripción de
 * Comunidad (ver CommunitySignupNotificationService.NotifySignupStatusAsync). Protegido por el
 * mismo secreto compartido.
 */
interface CommunitySignupStatusBody {
  kind: 'confirmed' | 'cancelled';
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
  email?: string | null;
  partySize?: number;
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

  let body: CommunitySignupStatusBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.businessName || !body.name || !body.targetTitle) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!body.email || (body.kind !== 'confirmed' && body.kind !== 'cancelled')) {
    return NextResponse.json({ error: 'Missing email or invalid kind' }, { status: 400 });
  }

  const sent = await sendCommunitySignupStatusEmail({
    kind: body.kind,
    signupKind: body.signupKind === 'event' ? 'event' : 'volunteer',
    language: body.language === 'en' ? 'en' : 'es',
    businessName: body.businessName,
    businessEmail: body.businessEmail ?? null,
    businessPhone: body.businessPhone ?? null,
    slug: body.slug ?? null,
    brand: { name: body.businessName, logoUrl: body.logoUrl ?? null, color: body.brandColor ?? null },
    name: body.name,
    email: body.email,
    partySize: body.partySize ?? 1,
    targetTitle: body.targetTitle,
    eventStartsAt: body.eventStartsAt ?? null,
    eventEndsAt: body.eventEndsAt ?? null,
    eventLocation: body.eventLocation ?? null,
    timezone: body.timezone ?? null,
  });

  return NextResponse.json(sent);
}

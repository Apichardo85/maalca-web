import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { PublicIntake } from '@/lib/intake';
import { IntakeForm } from './IntakeForm';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function loadIntake(token: string): Promise<PublicIntake | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  try {
    const res = await fetch(`${API_BASE}/api/public/intakes/${token}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Acceso por token: no se indexa. La vista previa al compartir por WhatsApp lleva la marca de MaalCa.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const intake = await loadIntake(token);
  const robots = { index: false, follow: false };
  if (!intake) return { title: 'MaalCa', robots };
  const title = intake.title;
  const description =
    intake.language === 'en'
      ? `Prepared for ${intake.businessName} by MaalCa`
      : `Preparado para ${intake.businessName} por MaalCa`;
  return {
    title,
    description,
    robots,
    openGraph: { title, description, siteName: 'MaalCa', images: [{ url: '/logo/maalca-full-light.png' }] },
  };
}

// Formulario público de levantamiento — el prospecto responde sin login, desde el celular, con
// autoguardado. Se crea y se comparte desde /ops/levantamientos.
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const intake = await loadIntake(token);
  if (!intake) notFound();
  return <IntakeForm token={token} initial={intake} />;
}

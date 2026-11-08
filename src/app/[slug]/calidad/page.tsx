// Página pública de calidad del agua (la que abre el QR): proceso, análisis de laboratorio y mantenimiento.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CalidadPublic } from './CalidadPublic';
import type { PublicWaterQuality } from '@/lib/water-quality';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getData(slug: string): Promise<PublicWaterQuality | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/water-quality`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  return { title: data ? `Calidad del agua — ${data.businessName}` : 'Calidad del agua' };
}

export default async function CalidadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  return <CalidadPublic data={data} />;
}

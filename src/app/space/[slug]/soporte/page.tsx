import { SoporteContent } from './SoporteContent';

/** Soporte del negocio: sus solicitudes a MaalCa, la conversación de cada una y los puntos del mes. */
export default async function SoportePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { slug } = await params;
  const { ticket } = await searchParams;
  return <SoporteContent slug={slug} initialTicketId={ticket ?? null} />;
}

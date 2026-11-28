import { TicketDetail } from './TicketDetail';

export default async function OpsSoporteTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketDetail id={id} />;
}

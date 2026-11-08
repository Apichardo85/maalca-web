import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { GastosContent } from './GastosContent';
import { monthBounds, type Expense, type ProfitReport } from '@/lib/expenses';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Gastos y utilidad mensual. Gate por módulo activo, repetido acá para que la URL no sea alcanzable a mano.
export default async function GastosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const spaceRes = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (spaceRes.status === 404) redirect('/onboarding');
  if (spaceRes.status === 403) redirect('/');
  if (!spaceRes.ok) throw new Error(`Failed to load space: ${spaceRes.status}`);

  const space = await spaceRes.json();
  if (!space.business.modulosActivos.includes('expenses')) redirect(`/space/${slug}`);

  // El mes de hoy según la hora del negocio (RD, UTC-4), no la del servidor.
  const month = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' }).slice(0, 7);
  const { from, to } = monthBounds(month);

  const headers = { Authorization: `Bearer ${token}`, 'X-Affiliate-Id': space.business.id };
  const base = `${API}/api/affiliates/${space.business.id}`;

  let expenses: Expense[] = [];
  let profit: ProfitReport | null = null;
  try {
    const [eRes, pRes] = await Promise.all([
      fetch(`${base}/expenses?from=${from}&to=${to}`, { headers, cache: 'no-store' }),
      fetch(`${base}/reports/profit?month=${month}`, { headers, cache: 'no-store' }),
    ]);
    if (eRes.ok) expenses = await eRes.json();
    if (pRes.ok) profit = await pRes.json();
  } catch {
    // Queda vacío: GastosContent muestra el estado vacío en vez de tronar.
  }

  return (
    <GastosContent
      slug={slug}
      currency={space.business.currency === 'DOP' ? 'DOP' : 'USD'}
      brand={{ name: space.business.name, logoUrl: space.business.logoUrl ?? null, primaryColor: space.business.primaryColor ?? null }}
      initialMonth={month}
      initialExpenses={expenses}
      initialProfit={profit}
    />
  );
}

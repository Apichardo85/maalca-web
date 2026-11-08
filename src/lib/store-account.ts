'use client';

// Cuenta del cliente DENTRO de una tienda (miembro/mayorista). Identidad = sesión de Supabase (Google o enlace
// por correo); lo que la persona es para ESTA tienda (estado, lista de precios) lo responde maalca-api en
// /api/public/store/{slug}/me. Los precios de miembro se piden aparte y se aplican en el navegador solo para
// mostrarlos: el API recalcula todo al crear el pedido (/api/public/store/{slug}/orders).
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export type StoreMemberStatus = 'unavailable' | 'none' | 'pending' | 'approved' | 'rejected';

export interface StoreMe {
  status: StoreMemberStatus;
  signupMode: 'approval' | 'open';
  signupNote: string | null;
  name: string | null;
  email: string | null;
  priceListName: string | null;
  discountPercent: number | null;
  minOrderAmount: number | null;
  /** Su lista es exenta de impuesto (reventa). */
  taxExempt?: boolean;
  /** Datos que dio al pedir la cuenta (editables en "Mi cuenta"). */
  phone?: string | null;
  businessName?: string | null;
  taxId?: string | null;
}

export interface StoreOrderSummary {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  fulfillmentType: string | null;
  trackingToken: string | null;
  priceListName: string | null;
  /** Líneas del pedido ("Comprar de nuevo"). Ausente en respuestas de un API anterior. */
  items?: { itemId: string; name: string; qty: number; unitPrice: number; imageUrl?: string | null }[] | null;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  /** Cuenta como compra (cobrada). Ausente en un API anterior. */
  counted?: boolean;
}

export interface JoinStoreInput {
  name: string;
  phone?: string;
  businessName?: string;
  taxId?: string;
  message?: string;
  /** Solo negocios con reparto. */
  address?: string;
  gpsLat?: number;
  gpsLng?: number;
  deliveryFrequency?: 'daily' | 'weekly' | 'on_demand';
  wantsCredit?: boolean;
}


// ── Portal del cliente con contrato (reparto): contrato, envases, saldo, facturas, pagos, entregas y próxima visita ──
export interface PortalContract {
  id: string;
  contractNumber: string | null;
  deliveryFrequency: string;
  billingCycle: string;
  creditDays: number;
  startDate: string;
  endDate: string | null;
  racksLoaned: number;
  bottlesLoaned: number;
  accepted: boolean;
  acceptedAt: string | null;
  acceptedByName: string | null;
  /** Aceptó una versión anterior: el texto cambió y debe volver a aceptar. */
  changedSinceAccepted: boolean;
  /** Huella del texto actual; se devuelve al aceptar. */
  documentHash: string;
}
export interface PortalContainer {
  containerTypeId: string;
  containerTypeName: string;
  delivered: number;
  returned: number;
  damaged: number;
  adjustments: number;
  outstanding: number;
}
export interface PortalOpenInvoice {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  open: number;
  ageDays: number;
  isOverdue: boolean;
}
export interface CustomerPortal {
  /** false = cuenta aprobada pero aún sin ficha de cliente con este correo. */
  linked: boolean;
  customerName: string;
  address: string | null;
  contract: PortalContract | null;
  containers: PortalContainer[];
  anaqueles: { label: string | null; location: string | null; status: string }[];
  balance: number;
  creditOnAccount: number;
  openInvoices: PortalOpenInvoice[];
  recentPayments: { paidAt: string; amount: number; method: string }[];
  recentDeliveries: {
    deliveredAt: string;
    items: { itemId: string | null; description: string; quantity: number; unitPrice: number; lineTotal: number }[];
    total: number;
  }[];
  nextVisit: { date: string; routeStatus: string; onTheWay: boolean; stopsBefore: number | null } | null;
  deliveryFrequency: string | null;
}
export interface PortalContractDocument {
  title: string;
  body: string;
  contractNumber: string | null;
  date: string;
  businessName: string;
  businessPhone: string | null;
  businessAddress: string | null;
  businessLogoUrl: string | null;
  businessColor: string | null;
  customerName: string;
}

export interface UseStoreAccount {
  /** true mientras se averigua si hay sesión. */
  loading: boolean;
  token: string | null;
  email: string | null;
  me: StoreMe | null;
  /** itemId → precio de su lista (vacío = precio público). */
  memberPrices: Map<string, number>;
  signInWithGoogle: () => Promise<void>;
  /** Enlace mágico por correo. Devuelve el mensaje de error, o null si se envió. */
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  join: (input: JoinStoreInput) => Promise<string | null>;
  loadOrders: () => Promise<StoreOrderSummary[]>;
  /** Corrige sus datos (nombre, teléfono, empresa, Tax ID). Devuelve el mensaje de error, o null si se guardó. */
  updateProfile: (input: { name?: string; phone?: string; businessName?: string; taxId?: string }) => Promise<string | null>;
  /** Su portal de reparto. null = no disponible (sin sesión, sin cuenta aprobada o negocio sin portal). */
  loadPortal: () => Promise<CustomerPortal | null>;
  /** Texto del contrato tal como se le muestra para aceptar. */
  loadContractDocument: () => Promise<PortalContractDocument | null>;
  /** Acepta el contrato: nombre escrito como firma + huella del texto que leyó. Devuelve el mensaje de error, o null si quedó aceptado. */
  acceptContract: (name: string, documentHash: string) => Promise<string | null>;
}

export function useStoreAccount(slug: string, enabled: boolean): UseStoreAccount {
  const [loading, setLoading] = useState(enabled);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [me, setMe] = useState<StoreMe | null>(null);
  const [memberPrices, setMemberPrices] = useState<Map<string, number>>(new Map());

  const call = useCallback(
    async (path: string, init?: RequestInit, tk: string | null = token) =>
      fetch(`${API_BASE}/api/public/store/${encodeURIComponent(slug)}${path}`, {
        ...init,
        headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${tk ?? ''}` },
      }),
    [slug, token],
  );

  const refresh = useCallback(
    async (tk: string | null) => {
      if (!tk) {
        setMe(null);
        setMemberPrices(new Map());
        return;
      }
      try {
        const res = await call('/me', undefined, tk);
        const data: StoreMe | null = res.ok ? await res.json() : null;
        setMe(data);
        if (data?.status === 'approved' && data.priceListName) {
          const pr = await call('/prices', undefined, tk);
          const list: { itemId: string; price: number }[] = pr.ok ? await pr.json() : [];
          setMemberPrices(new Map(list.map((p) => [p.itemId, p.price])));
        } else {
          setMemberPrices(new Map());
        }
      } catch {
        setMe(null);
        setMemberPrices(new Map());
      }
    },
    [call],
  );

  useEffect(() => {
    if (!enabled) return;
    const supabase = supabaseBrowser();
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const tk = data.session?.access_token ?? null;
      setToken(tk);
      setEmail(data.session?.user.email ?? null);
      refresh(tk).finally(() => alive && setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const tk = session?.access_token ?? null;
      setToken(tk);
      setEmail(session?.user.email ?? null);
      refresh(tk);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // refresh depende de token vía call; aquí solo se suscribe una vez por tienda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, slug]);

  // Al volver del login se regresa a esta misma tienda con ?cuenta=1 (abre la hoja de cuenta).
  const returnTo = () => {
    const path = `${window.location.pathname}?cuenta=1`;
    return `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(path)}`;
  };

  return {
    loading,
    token,
    email,
    me,
    memberPrices,
    signInWithGoogle: async () => {
      await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnTo() } });
    },
    signInWithEmail: async (address: string) => {
      const { error } = await supabaseBrowser().auth.signInWithOtp({
        email: address.trim(),
        options: { emailRedirectTo: returnTo(), shouldCreateUser: true },
      });
      return error ? error.message : null;
    },
    signOut: async () => {
      await supabaseBrowser().auth.signOut();
    },
    join: async (input: JoinStoreInput) => {
      const res = await call('/join', { method: 'POST', body: JSON.stringify(input) });
      const data = await res.json().catch(() => null);
      if (!res.ok) return data?.error?.message ?? 'Error';
      await refresh(token);
      return null;
    },
    loadOrders: async () => {
      const res = await call('/orders');
      return res.ok ? res.json() : [];
    },
    updateProfile: async (input) => {
      const res = await call('/me', { method: 'PATCH', body: JSON.stringify(input) });
      const data = await res.json().catch(() => null);
      if (!res.ok) return data?.error?.message ?? 'Error';
      setMe(data);
      return null;
    },
    loadPortal: async () => {
      try {
        const res = await call('/portal');
        return res.ok ? ((await res.json()) as CustomerPortal) : null;
      } catch {
        return null;
      }
    },
    loadContractDocument: async () => {
      try {
        const res = await call('/portal/contract');
        return res.ok ? ((await res.json()) as PortalContractDocument) : null;
      } catch {
        return null;
      }
    },
    acceptContract: async (name: string, documentHash: string) => {
      const res = await call('/portal/contract/accept', {
        method: 'POST',
        body: JSON.stringify({ name, agree: true, documentHash }),
      });
      if (res.ok) return null;
      const data = await res.json().catch(() => null);
      return data?.error?.message ?? 'Error';
    },
  };
}

/** Pedido con sesión: mismo cuerpo que el pedido público, pero el API aplica la lista del cliente. */
export function storeOrderEndpoint(slug: string): string {
  return `${API_BASE}/api/public/store/${encodeURIComponent(slug)}/orders`;
}

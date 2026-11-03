'use client';
// src/components/public/templates/RetailLayouts.tsx
//
// Retail tiene dos plantillas públicas sobre el MISMO motor de comercio (carrito, listas de precio, envíos,
// impuesto, cuentas de cliente): "boutique" (Retail.tsx, foto primero) y "marketplace" (Store.tsx, distribuidor
// tipo Amazon). El dueño elige en Diseño > Configuración (Affiliate.StoreLayout). Cada una carga en su propio
// chunk: una tienda boutique no descarga la de distribuidor y viceversa.
import dynamic from 'next/dynamic';
import type { PublicTemplateProps } from '@/lib/templates/registry';

const Boutique = dynamic(() => import('./Retail').then((m) => m.RetailTemplate));
const Marketplace = dynamic(() => import('./Store').then((m) => m.StoreTemplate));

export function RetailLayoutsTemplate(props: PublicTemplateProps) {
  return props.business.store_layout === 'marketplace' ? <Marketplace {...props} /> : <Boutique {...props} />;
}

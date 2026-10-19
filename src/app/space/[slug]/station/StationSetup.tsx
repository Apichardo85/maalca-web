'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { isPaidPlan } from '@/lib/plan-limits';

const btn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:border-brand-primary hover:text-brand-primary';

export function StationSetup({ slug, plan, businessName }: { slug: string; plan: string; businessName: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const [url, setUrl] = useState(`https://maalca.com/station/${slug}`);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const u = `${window.location.origin}/station/${slug}`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 320, margin: 2, errorCorrectionLevel: 'M' }).then(setQr).catch(() => setQr(null));
  }, [slug]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(getText('Link copiado.', 'Link copied.'));
    } catch {
      toast.error(url);
    }
  }

  const steps: Array<[string, string]> = [
    ['Instala Fully Kiosk Browser en la tablet de la cocina.', 'Install Fully Kiosk Browser on the kitchen tablet.'],
    ['Primero, sin bloquear nada: pon el link de arriba como "Start URL", ábrelo e inicia sesión con la cuenta del negocio. La sesión queda guardada.', 'First, without locking anything: set the link above as "Start URL", open it and sign in with the business account. The session stays saved.'],
    ['Web Browsing Settings → URL Whitelist: solo el link de la estación. Así nadie puede navegar a otra página.', 'Web Browsing Settings → URL Whitelist: only the station link. Nobody can browse elsewhere.'],
    ['Toolbars & Appearance: oculta la barra de direcciones, la de navegación y la de estado.', 'Toolbars & Appearance: hide the address, navigation and status bars.'],
    ['Kiosk Mode: actívalo con un PIN de salida que solo sepas tú.', 'Kiosk Mode: enable it with an exit PIN only you know.'],
    ['Device Management: "Keep Screen On" y "Launch on Boot" activados.', 'Device Management: turn on "Keep Screen On" and "Launch on Boot".'],
    ['Al empezar el día, toca "Iniciar turno" en la tablet para que pueda sonar.', 'At the start of the day, tap "Start shift" on the tablet so it can ring.'],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">{getText('Estación de pedidos', 'Order station')}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
        {getText(
          `Pantalla dedicada para la cocina de ${businessName}: suena con cada pedido nuevo hasta que alguien lo acepta, imprime el ticket y sigue los pedidos en proceso. Funciona en modo kiosko: el personal no puede salir de ella.`,
          `Dedicated kitchen screen for ${businessName}: rings on every new order until someone accepts it, prints the ticket and tracks orders in progress. It runs in kiosk mode: staff can't leave it.`,
        )}
      </p>

      {!isPaidPlan(plan as 'free' | 'entrepreneur' | 'enterprise') && (
        <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {getText('La Estación de pedidos es parte de los planes pagos.', 'The Order Station is part of the paid plans.')}
        </p>
      )}

      <div className="mt-6 grid gap-6 rounded-2xl border border-gray-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
            {getText('Link de la estación', 'Station link')}
          </p>
          <p className="mt-1 break-all font-mono text-sm">{url}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={copy} className={btn}>{getText('Copiar link', 'Copy link')}</button>
            <a href={`/station/${slug}`} target="_blank" rel="noopener" className={btn}>
              {getText('Abrir en pestaña nueva', 'Open in new tab')}
            </a>
            <a href={`/station/${slug}`} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
              {getText('Usar esta pantalla como estación', 'Use this screen as the station')}
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              '"Usar esta pantalla" convierte este dispositivo en la estación (sin menú del dashboard). Para volver al dashboard en una tablet con Fully Kiosk, sal con tu PIN.',
              '"Use this screen" turns this device into the station (no dashboard menu). To get back to the dashboard on a Fully Kiosk tablet, exit with your PIN.',
            )}
          </p>
        </div>
        {qr && (
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR" className="h-40 w-40 rounded-lg bg-white p-1" />
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              {getText('Escanéalo desde la tablet', 'Scan it from the tablet')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold">{getText('Configurar la tablet (Fully Kiosk)', 'Set up the tablet (Fully Kiosk)')}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600 dark:text-neutral-300">
          {steps.map(([es, en], i) => <li key={i}>{getText(es, en)}</li>)}
        </ol>
      </div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}

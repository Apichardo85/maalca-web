// Página pública genérica de "gracias" a la que Stripe redirige el teléfono del cliente
// después de pagar un QR generado desde el POS (Etapa D, fase 2). No necesita afiliado ni
// auth — es solo cosmética: el POS se entera del pago real vía SignalR (webhook de Stripe
// Connect -> OrdersHub), no por esta página ni por su query string.
export default async function PosPayStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const success = status === 'success';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center dark:bg-neutral-950">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${success ? 'bg-green-100' : 'bg-gray-200 dark:bg-neutral-800'}`}>
        {success ? '✅' : '↩️'}
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {success ? 'Pago recibido' : 'Pago cancelado'}
      </h1>
      <p className="max-w-xs text-sm text-gray-500 dark:text-neutral-400">
        {success
          ? 'Gracias — ya puedes guardar tu teléfono.'
          : 'No se completó el pago. Puedes cerrar esta pantalla.'}
      </p>
    </div>
  );
}

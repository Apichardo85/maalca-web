import { NextResponse } from "next/server";

/**
 * Stub endpoint para capturar intents de "avísame cuando el item esté disponible".
 *
 * POST /api/menu/notify
 * Body: { affiliateId, itemId, itemName, customerName, contact, contactType }
 *
 * TODO (ticket aparte): conectar a n8n webhook para:
 *   1. Guardar lead en DB/sheet
 *   2. Schedulear notificación cuando llegue la hora del periodo
 *   3. Enviar WhatsApp/email automático
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Por ahora solo logueamos en server — suficiente para validación de UI
    console.log("[menu/notify]", {
      timestamp: new Date().toISOString(),
      ...body,
    });
    return NextResponse.json({ ok: true, queued: true });
  } catch (err) {
    console.error("[menu/notify] error:", err);
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}

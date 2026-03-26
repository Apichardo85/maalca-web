import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/services/n8n-service';
import type { ReservationPayload } from '@/lib/types/n8n.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const reservation: ReservationPayload = {
      customerName: body.customerName || '',
      customerPhone: body.customerPhone,
      date: body.date || '',
      time: body.time || '',
      partySize: body.partySize || 1,
      notes: body.notes,
    };

    if (!reservation.customerName || !reservation.date || !reservation.time) {
      return NextResponse.json(
        { success: false, error: 'Nombre, fecha y hora son requeridos' },
        { status: 400 }
      );
    }

    const tenantId = body.tenantId || 'the-little-dominican';

    n8nService.sendReservation(tenantId, reservation).catch((err) => {
      console.error('[api/reservations/create] n8n forwarding failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Reservación recibida',
    });
  } catch (err) {
    console.error('[api/reservations/create] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error procesando la reservación' },
      { status: 500 }
    );
  }
}

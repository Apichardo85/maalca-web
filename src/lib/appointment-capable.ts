/**
 * Qué tipos de negocio tienen agenda de citas, en un solo lugar.
 *
 * Hasta ahora cada pantalla repetía su propia condición: el catálogo abría el selector de
 * Modalidad solo con `businessType === 'Service'` y Configuración hacía lo mismo con el link de
 * reuniones, mientras la duración del servicio usaba `Barber || Service`. Resultado: una
 * barbería podía fijar duración pero no podía ofrecer una consulta virtual, y el criterio vivía
 * duplicado en tres archivos. Esto lo centraliza.
 *
 * La lista son los tipos cuyo template público renderiza PublicBookingSection (ver
 * components/public/templates/Barber.tsx y Service.tsx). Restaurant queda fuera a propósito:
 * usa TableReservationSection, que es otro flujo (ver el comentario en Restaurant.tsx).
 * Si un template nuevo monta el widget de citas, su tipo se agrega acá y las tres pantallas
 * se enteran solas.
 */
const APPOINTMENT_BUSINESS_TYPES = ['Barber', 'Service'] as const;

export function hasAppointments(businessType?: string | null): boolean {
  return !!businessType && (APPOINTMENT_BUSINESS_TYPES as readonly string[]).includes(businessType);
}

/** Sugerencias de rol para el módulo Personal, por tipo de negocio. El campo Role en el
 *  backend (TeamMember) es texto libre — esto es solo UX, no una restricción real, así que
 *  el dueño siempre puede escribir un rol distinto al sugerido. */
export const ROLE_SUGGESTIONS: Record<string, { es: string; en: string }[]> = {
  restaurant: [
    { es: 'Mesero', en: 'Waiter' },
    { es: 'Cocinero', en: 'Cook' },
    { es: 'Anfitrión', en: 'Host' },
    { es: 'Cajero', en: 'Cashier' },
  ],
  barber: [
    { es: 'Barbero', en: 'Barber' },
    { es: 'Estilista', en: 'Stylist' },
    { es: 'Recepcionista', en: 'Receptionist' },
  ],
  service: [
    { es: 'Técnico', en: 'Technician' },
    { es: 'Recepcionista', en: 'Receptionist' },
  ],
  retail: [
    { es: 'Vendedor', en: 'Salesperson' },
    { es: 'Cajero', en: 'Cashier' },
    { es: 'Almacén', en: 'Warehouse' },
  ],
  creator: [
    { es: 'Editor', en: 'Editor' },
    { es: 'Diseñador', en: 'Designer' },
    { es: 'Asistente', en: 'Assistant' },
  ],
  publisher: [
    { es: 'Editor', en: 'Editor' },
    { es: 'Corrector', en: 'Proofreader' },
    { es: 'Diseñador', en: 'Designer' },
  ],
  professional: [
    { es: 'Asistente', en: 'Assistant' },
    { es: 'Recepcionista', en: 'Receptionist' },
    { es: 'Higienista', en: 'Hygienist' },
  ],
};

const DEFAULT_SUGGESTIONS = [
  { es: 'Empleado', en: 'Staff' },
  { es: 'Asistente', en: 'Assistant' },
];

export function getRoleSuggestions(businessType: string, language: 'es' | 'en') {
  const list = ROLE_SUGGESTIONS[businessType.toLowerCase()] ?? DEFAULT_SUGGESTIONS;
  return list.map((r) => (language === 'es' ? r.es : r.en));
}

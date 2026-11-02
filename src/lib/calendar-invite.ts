/**
 * Invitación de calendario para citas (.ics + link de Google Calendar).
 *
 * Por qué existe: hasta ahora la confirmación de cita era solo un correo con el link de la
 * reunión. El cliente lo leía y la cita no quedaba en ningún calendario, así que nadie recibía
 * aviso del propio teléfono y las asesorías virtuales se caían por olvido. Esto genera la
 * invitación en maalca-web (donde ya vive Resend) en vez de montar un servicio de calendario:
 * un .ics es texto plano y no añade dependencias — ver "ligero y veloz" en CLAUDE.md.
 *
 * La hora de la cita se guarda como fecha "bare" (yyyy-MM-dd) + HH:mm en la zona del NEGOCIO,
 * no como instante UTC (ver Appointment.Date/Time en maalca-api). Un .ics necesita un instante
 * real, así que acá se convierte usando la zona IANA del afiliado, con el mismo criterio que
 * business-hours.ts: Intl.DateTimeFormat con timeZone, nunca la zona del servidor.
 */

/**
 * Usado solo si el servicio no tiene DurationMinutes (es nullable a propósito — ver Service.cs).
 * 30 para empatar con AppointmentSchedule.DefaultDurationMinutes en maalca-api: si el .ics
 * usara otro número, el evento del calendario duraría distinto que el slot reservado.
 */
export const DEFAULT_APPOINTMENT_MINUTES = 30;

/** Fallback cuando el afiliado no fijó Timezone. Mayoría de negocios en RD. */
export const DEFAULT_APPOINTMENT_TIMEZONE = 'America/Santo_Domingo';

export interface AppointmentInvite {
  /** Token de la cita — se usa como UID estable para que una reagenda actualice el evento. */
  uid?: string | null;
  /** Título del evento, ej. "Asesoría inicial — MaalCa". */
  title: string;
  /** yyyy-MM-dd, en la zona del negocio. */
  date: string;
  /** HH:mm, en la zona del negocio. */
  time: string;
  durationMinutes?: number | null;
  timezone?: string | null;
  description?: string | null;
  /** Link de la reunión virtual, o la dirección física. */
  location?: string | null;
  /** Link de autogestión (/cita/{token}). */
  url?: string | null;
  /**
   * SEQUENCE de RFC 5545. Con el mismo UID, un número mayor le dice al calendario del cliente
   * "esto actualiza el evento que ya tienes" en vez de crear otro. La reserva manda 0 y el
   * correo de "el negocio confirmó" manda 1, para que confirmar no duplique la cita.
   */
  sequence?: number | null;
}

/**
 * Offset en minutos de una zona IANA para un instante dado (positivo al este de UTC).
 * Formatea el instante en la zona destino y compara contra el mismo reloj leído como UTC.
 */
function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const read = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // hour12:false en en-US devuelve 24 para medianoche en algunos runtimes.
  const hour = read('hour') === 24 ? 0 : read('hour');
  const asIfUtc = Date.UTC(read('year'), read('month') - 1, read('day'), hour, read('minute'), read('second'));
  return (asIfUtc - instant.getTime()) / 60000;
}

/**
 * yyyy-MM-dd + HH:mm leídos en una zona IANA → instante UTC real.
 * Dos pasadas a propósito: el offset depende del instante, y una cita que cae justo después de
 * un cambio de horario se resolvería con el offset viejo si solo se estimara una vez.
 */
export function zonedDateTimeToUtc(date: string, time: string, timeZone: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const t = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!d || !t) return null;

  const hour = Number(t[1]);
  const minute = Number(t[2]);
  if (hour > 23 || minute > 59) return null;

  const wallClockAsUtc = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), hour, minute);
  try {
    let instant = wallClockAsUtc - zoneOffsetMinutes(new Date(wallClockAsUtc), timeZone) * 60000;
    instant = wallClockAsUtc - zoneOffsetMinutes(new Date(instant), timeZone) * 60000;
    const result = new Date(instant);
    return Number.isNaN(result.getTime()) ? null : result;
  } catch {
    // Zona IANA inválida guardada en el afiliado — no vale tumbar el correo por esto.
    return null;
  }
}

/** 20261103T190000Z — formato de fecha-hora UTC de RFC 5545. */
function icsStamp(instant: Date): string {
  return `${instant.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/** RFC 5545 §3.3.11: ; , \ y saltos de línea van escapados en campos de texto. */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 §3.1: ninguna línea pasa de 75 octetos; las siguientes van con un espacio delante. */
function icsFold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest) chunks.push(` ${rest}`);
  return chunks.join('\r\n');
}

function resolved(invite: AppointmentInvite): { start: Date; end: Date } | null {
  const timeZone = invite.timezone?.trim() || DEFAULT_APPOINTMENT_TIMEZONE;
  const start = zonedDateTimeToUtc(invite.date, invite.time, timeZone);
  if (!start) return null;
  const minutes = invite.durationMinutes && invite.durationMinutes > 0
    ? invite.durationMinutes
    : DEFAULT_APPOINTMENT_MINUTES;
  return { start, end: new Date(start.getTime() + minutes * 60000) };
}

/**
 * Archivo .ics de un solo evento, listo para adjuntar. METHOD:PUBLISH (no REQUEST) a propósito:
 * no estamos haciendo invitación con RSVP contra un organizador real, solo dándole al cliente
 * un evento que pueda guardar. Devuelve null si la fecha/hora no se pudo resolver, para que el
 * llamador mande el correo sin adjunto en vez de no mandar nada.
 */
export function buildAppointmentIcs(invite: AppointmentInvite): string | null {
  const times = resolved(invite);
  if (!times) return null;

  const uid = `${(invite.uid || `${invite.date}-${invite.time}`).replace(/[^\w.-]/g, '')}@maalca.com`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MaalCa//Agenda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(times.start)}`,
    `DTEND:${icsStamp(times.end)}`,
    `SUMMARY:${icsEscape(invite.title)}`,
    invite.description ? `DESCRIPTION:${icsEscape(invite.description)}` : null,
    invite.location ? `LOCATION:${icsEscape(invite.location)}` : null,
    invite.url ? `URL:${invite.url}` : null,
    'STATUS:CONFIRMED',
    `SEQUENCE:${invite.sequence && invite.sequence > 0 ? Math.floor(invite.sequence) : 0}`,
    'TRANSP:OPAQUE',
    // Aviso del propio calendario del cliente 30 min antes — además del recordatorio por correo.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio',
    'TRIGGER:-PT30M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((line): line is string => line !== null);

  return `${lines.map(icsFold).join('\r\n')}\r\n`;
}

/**
 * Link "Añadir a Google Calendar". Complementa el .ics: en móvil (sobre todo Gmail en Android)
 * un botón es más confiable que pedirle al usuario que abra un adjunto.
 */
export function googleCalendarUrl(invite: AppointmentInvite): string | null {
  const times = resolved(invite);
  if (!times) return null;

  const params = new URLSearchParams({ action: 'TEMPLATE', text: invite.title });
  if (invite.description) params.set('details', invite.description);
  if (invite.location) params.set('location', invite.location);

  // `dates` va fuera de URLSearchParams a propósito: el separador entre inicio y fin es una
  // barra literal y URLSearchParams la escaparía a %2F.
  const dates = `${icsStamp(times.start)}/${icsStamp(times.end)}`;
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${dates}`;
}

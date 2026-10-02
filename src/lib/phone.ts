/**
 * Teléfonos — un solo criterio para toda la app (formularios públicos y del panel).
 *
 * Mercado: EE.UU./Rep. Dominicana (plan NANP: 10 dígitos, ej. (809) 669-9494). Si el número empieza
 * con "+" se acepta como internacional (8–15 dígitos, formato E.164). Antes cada input hacía lo suyo
 * (o nada): un teléfono de 20 dígitos pasaba como válido y terminaba en el panel y en los correos.
 */

/** Solo dígitos del valor. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Formatea mientras se escribe. "+..." queda internacional; lo demás se arma como (809) 669-9494. */
export function formatPhoneInput(value: string): string {
  const trimmed = value.trimStart();
  if (trimmed.startsWith('+')) {
    return '+' + phoneDigits(trimmed).slice(0, 15);
  }
  let d = phoneDigits(trimmed);
  if (d.length > 10 && d.startsWith('1')) d = d.slice(1); // 1-809-... → 809-...
  d = d.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** ¿Es un teléfono usable? NANP: 10 dígitos con código de área 2–9; internacional: +8 a 15 dígitos. */
export function isValidPhone(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  const d = phoneDigits(v);
  if (v.startsWith('+')) return d.length >= 8 && d.length <= 15;
  return d.length === 10 && /^[2-9]/.test(d);
}

/** Lo que se guarda/manda al servidor: dígitos (con "+" si es internacional), sin máscara. */
export function normalizePhone(value: string): string {
  const v = value.trim();
  const d = phoneDigits(v);
  return v.startsWith('+') ? `+${d}` : d;
}

/** Atributos comunes para un <input> de teléfono. */
export const PHONE_INPUT_PROPS = {
  type: 'tel',
  inputMode: 'tel',
  autoComplete: 'tel',
  maxLength: 17,
} as const;

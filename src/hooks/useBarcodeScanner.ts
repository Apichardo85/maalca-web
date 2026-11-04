import { useEffect, useRef } from 'react';

/**
 * Escucha una pistola lectora de código de barras sin que haya que enfocar ningún campo: junta las
 * teclas que llegan con menos de 100 ms entre sí y, con Enter, entrega el código. Ignora lo que se
 * teclea dentro de un input (ahí el campo de búsqueda maneja su propio Enter).
 */
export function useBarcodeScanner(onScan: (code: string) => void, enabled = true) {
  const cb = useRef(onScan);
  useEffect(() => {
    cb.current = onScan;
  });

  useEffect(() => {
    if (!enabled) return;
    let buf = '';
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const now = Date.now();
      if (now - last > 100) buf = '';
      last = now;
      if (e.key === 'Enter') {
        if (buf.length >= 6) {
          e.preventDefault();
          cb.current(buf);
        }
        buf = '';
        return;
      }
      if (e.key.length === 1) buf += e.key;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

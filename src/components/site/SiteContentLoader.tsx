"use client";

import { useEffect } from "react";
import { applySiteOverrides } from "@/hooks/useSimpleLanguage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Carga una vez los overrides del copy del sitio (PlatformContent, editado desde /ops/sitio) y
 * los aplica sobre el diccionario por defecto. Montado en el layout raíz. No renderiza nada; si
 * el API falla, la web sigue con sus textos por defecto (el fetch nunca bloquea el render).
 */
export default function SiteContentLoader() {
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/public/site-content`)
      .then((r) => (r.ok ? r.json() : []))
      .then((entries) => {
        if (alive && Array.isArray(entries)) applySiteOverrides(entries);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return null;
}

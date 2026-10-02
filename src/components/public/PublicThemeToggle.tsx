'use client';

import { useEffect, useState } from 'react';

/**
 * Sol/luna para el visitante de la vitrina. Comparte el mecanismo del resto del sitio
 * (localStorage 'theme' + html[data-theme="dark"]) que el script del layout ya aplica antes del
 * primer pintado, así que la elección persiste entre páginas. Las plantillas definen sus colores
 * como variables CSS con una variante bajo [data-theme="dark"] — este botón solo cambia el atributo.
 */
export default function PublicThemeToggle({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // modo privado: el cambio vale para esta visita
    }
  };

  const base =
    variant === 'dark'
      ? 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
      : 'bg-white/90 border border-gray-200 text-gray-700 hover:bg-white shadow-md';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!mounted}
      aria-label={dark ? 'Modo claro / Light mode' : 'Modo oscuro / Dark mode'}
      title={dark ? 'Modo claro / Light mode' : 'Modo oscuro / Dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform hover:scale-105 active:scale-95 ${base}`}
    >
      <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>{mounted && dark ? '☀️' : '🌙'}</span>
    </button>
  );
}

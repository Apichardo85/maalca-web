"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Clip mudo en loop para la landing. Se reproduce solo cuando está a la vista (40 %) y se
 * pausa al salir, para no gastar datos ni batería en clips que nadie mira. Con
 * prefers-reduced-motion muestra únicamente el poster. `preload="none"` (o "metadata" en el
 * hero) evita descargar el video hasta que haga falta.
 */
export default function LandingClip({
  src,
  poster,
  label,
  className,
  eager = false,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  /** true para el hero: arranca de inmediato, sin esperar a que entre en pantalla. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion) return;
    if (eager) {
      v.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [eager, reducedMotion, src]);

  if (reducedMotion) {
    return <img src={poster} alt={label} className={className} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? "metadata" : "none"}
      aria-label={label}
    />
  );
}

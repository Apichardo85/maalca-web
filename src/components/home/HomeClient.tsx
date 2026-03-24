"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Counter } from "@/components/ui/Counter";

/**
 * Client-side interactive components for the homepage
 * This keeps the bundle small by only loading client JS for interactivity
 */
interface HomeClientProps {
  t: (key: string) => string;
}

export function HomeClient({ t }: HomeClientProps) {
  const router = useRouter();

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleProjectClick = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return {
    scrollToSection,
    handleProjectClick,
    Counter: () => (
      <Counter to={7} duration={2} />
    )
  };
}

/**
 * Static stats data - no client code needed
 */
export const statsData = [
  { number: 7, label: 'Proyectos Activos', suffix: '+' },
  { number: 50, label: 'Colaboradores', suffix: '+' },
  { number: 1000, label: 'Clientes Satisfechos', suffix: '+' },
  { number: 5, label: 'Años de Experiencia', suffix: '' }
];

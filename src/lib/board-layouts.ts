// Plantillas del Menu Board — tipos y helpers puros (sin 'use client') para poder usarlos
// tanto desde páginas de servidor como desde los componentes de cliente del board/dashboard.
export type BoardLayoutName = 'Classic' | 'Hero' | 'Grid' | 'Editorial' | 'Carousel' | 'Plates' | 'Bold';

/** Plantillas con vista propia ya implementada (las demás caen a Classic). Es lo que ofrece el selector. */
export const IMPLEMENTED_LAYOUTS: BoardLayoutName[] = ['Classic', 'Hero', 'Grid', 'Plates'];

const ALL_LAYOUTS: BoardLayoutName[] = ['Classic', 'Hero', 'Grid', 'Editorial', 'Carousel', 'Plates', 'Bold'];

export function normalizeLayout(value: string | null | undefined): BoardLayoutName {
  return ALL_LAYOUTS.find((l) => l === value) ?? 'Classic';
}

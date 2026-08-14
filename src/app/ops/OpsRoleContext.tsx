'use client';

import { createContext, useContext } from 'react';

export type OpsRole = 'Owner' | 'Support' | null;

const OpsRoleContext = createContext<OpsRole>(null);

export function OpsRoleProvider({ role, children }: { role: OpsRole; children: React.ReactNode }) {
  return <OpsRoleContext.Provider value={role}>{children}</OpsRoleContext.Provider>;
}

/** true solo para Owner — usar para gatear publicar/pausar y gestión de equipo. */
export function useOpsCanManage() {
  return useContext(OpsRoleContext) === 'Owner';
}

export function useOpsRole() {
  return useContext(OpsRoleContext);
}

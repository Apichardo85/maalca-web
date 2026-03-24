import type { ReactNode } from 'react'
import TLDDashboardLayout from './_TLDDashboardLayout'

export default function Layout({ children }: { children: ReactNode }) {
  return <TLDDashboardLayout>{children}</TLDDashboardLayout>
}

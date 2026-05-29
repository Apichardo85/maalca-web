import type { Metadata } from 'next';
import { editorialMetadata } from './metadata';
import EditorialNav from "@/components/editorial/EditorialNav";
import EditorialFooter from "@/components/editorial/EditorialFooter";

export const metadata: Metadata = editorialMetadata;

export default function EditorialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      <EditorialNav />
      <main>{children}</main>
      <EditorialFooter />
    </div>
  );
}

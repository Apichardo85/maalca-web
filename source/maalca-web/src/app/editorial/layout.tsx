import type { Metadata } from 'next';
import { editorialMetadata } from './metadata';

export const metadata: Metadata = editorialMetadata;

export default function EditorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

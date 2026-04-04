import type { Metadata } from "next";
import CiriNav from "@/components/ciriwhispers/CiriNav";
import CiriFooter from "@/components/ciriwhispers/CiriFooter";

export const metadata: Metadata = {
  title: "CiriWhispers | Lo bello tambien sangra",
  description:
    "Historias que no se cuentan en voz alta. Microcuentos, poemas, cartas y novelas por Ciriaco A. Pichardo.",
  openGraph: {
    title: "CiriWhispers | Lo bello tambien sangra",
    description:
      "Historias que no se cuentan en voz alta. Microcuentos, poemas, cartas y novelas.",
    url: "https://maalca.com/ciriwhispers",
    type: "website",
  },
};

export default function CiriWhispersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <CiriNav />
      <main>{children}</main>
      <CiriFooter />
    </div>
  );
}

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
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1B11]">
      <CiriNav />
      <main>{children}</main>
      <CiriFooter />
    </div>
  );
}

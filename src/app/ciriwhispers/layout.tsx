import type { Metadata } from "next";
import CiriNav from "@/components/ciriwhispers/CiriNav";
import CiriFooter from "@/components/ciriwhispers/CiriFooter";
import "./ciri.css";
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
    <div className="ciri-theme min-h-screen">
      <CiriNav />
      <main>{children}</main>
      <CiriFooter />
    </div>
  );
}

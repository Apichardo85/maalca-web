import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaalCa - Ecosistema Creativo",
  description: "Ecosistema creativo y empresarial que conecta ideas, personas y proyectos desde República Dominicana hacia el mundo",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.svg',
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}

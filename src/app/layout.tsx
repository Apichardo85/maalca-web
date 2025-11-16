import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
  keywords: ["ecosistema creativo", "editorial", "República Dominicana", "proyectos creativos", "MaalCa"],
  authors: [{ name: "MaalCa" }],
  creator: "MaalCa",
  publisher: "MaalCa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.svg',
    apple: '/logo-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://maalca.com',
    siteName: 'MaalCa',
    title: 'MaalCa - Ecosistema Creativo',
    description: 'Ecosistema creativo y empresarial que conecta ideas, personas y proyectos desde República Dominicana hacia el mundo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaalCa - Ecosistema Creativo',
    description: 'Ecosistema creativo y empresarial que conecta ideas, personas y proyectos desde República Dominicana hacia el mundo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Resource hints for performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

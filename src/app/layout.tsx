import type { Metadata } from "next";
import { Playfair_Display, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
export const dynamic = "force-dynamic";

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

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  // Required so relative openGraph.images (affiliate pages' /logo-icon.svg
  // fallback, etc.) resolve to an absolute URL instead of localhost when link
  // previews are unfurled in production.
  metadataBase: new URL("https://maalca.com"),
  title: "MaalCa — Tu espacio digital",
  description:
    "Crea, personaliza, publica y gestiona el espacio digital de tu negocio. Sin código. Sin plantillas genéricas.",
  keywords: [
    "espacio digital",
    "negocios independientes",
    "República Dominicana",
    "sin código",
    "MaalCa",
  ],
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
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/favicon.svg",
    // iOS no soporta SVG para el apple-touch-icon -- tiene que ser un PNG real (antes
    // apuntaba a logo-icon.svg, que iOS simplemente ignoraba).
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://maalca.com",
    siteName: "MaalCa",
    title: "MaalCa — Tu espacio digital",
    description:
      "Crea, personaliza, publica y gestiona el espacio digital de tu negocio. Sin código. Sin plantillas genéricas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaalCa — Tu espacio digital",
    description:
      "Crea, personaliza, publica y gestiona el espacio digital de tu negocio. Sin código. Sin plantillas genéricas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
        {/* Blocking, runs before first paint — sets data-theme from the
            saved preference (or system preference) so every screen loads in
            the right theme from the start, not just after ThemeToggle's
            post-hydration effect corrects it. Must stay inline/synchronous;
            a useEffect would flash the wrong theme first. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${caveat.variable} antialiased`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <GoogleAnalytics />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

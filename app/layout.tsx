import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/content/site.config";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { StickyNav } from "@/components/nav/StickyNav";
import { Grain } from "@/components/ui/Grain";
import { ScrollDepth } from "@/components/ScrollDepth";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://eltoni.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "EL TONI — Urbano latino | Escucha TU VENENO",
  description:
    "EL TONI, urbano latino desde España. Escucha TU VENENO y todos sus singles en Spotify, Apple Music y YouTube. Música honesta sobre el amor y el desamor.",
  keywords: ["EL TONI", "urbano latino", "TU VENENO", "música", "Spotify"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "EL TONI",
    title: "EL TONI — Urbano latino",
    description: "Escucha TU VENENO y todos los singles de EL TONI.",
    url: SITE_URL,
    images: [{ url: site.photos.heroRed, width: 1200, height: 630, alt: "EL TONI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EL TONI — Urbano latino",
    description: "Escucha TU VENENO y todos los singles de EL TONI.",
    images: [site.photos.heroRed],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1A1310",
  colorScheme: "dark",
};

function MusicGroupJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: site.artist,
    genre: "Urbano latino",
    url: SITE_URL,
    sameAs: [site.socials.spotify, site.socials.appleMusic, site.socials.youtube],
    album: site.releases.map((r) => ({
      "@type": "MusicRecording",
      name: r.title,
      datePublished: r.date,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <head>
        {/* warm up the Spotify embed origins (loaded lazily, click-to-play) */}
        <link rel="preconnect" href="https://open.spotify.com" />
        <link rel="preconnect" href="https://i.scdn.co" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-cream">
        <a
          href="#inicio"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Saltar al contenido
        </a>
        <MusicGroupJsonLd />
        <AudioProvider>
          <StickyNav />
          <main>{children}</main>
        </AudioProvider>
        <Grain />
        <ScrollDepth />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

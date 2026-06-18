import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/content/site.config";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { Grain } from "@/components/ui/Grain";
import { ScrollDepth } from "@/components/ScrollDepth";
import { MarketingTags } from "@/components/MarketingTags";

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

const SITE_URL = site.url;
const OG_IMAGE = "/og.jpg"; // 1200×630 social card (scripts/make-og.mjs)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EL TONI — Urbano latino | Escucha TU VENENO",
    template: "%s — EL TONI",
  },
  description:
    "EL TONI, artista urbano latino desde España. Escucha TU VENENO y todos sus singles en Spotify, Apple Music y YouTube. Música honesta sobre el amor, el desamor y lo que no dijiste a tiempo.",
  keywords: [
    "EL TONI",
    "El Toni cantante",
    "urbano latino",
    "música urbana española",
    "TU VENENO",
    "NO VOLVERÉ",
    "single 2026",
    "Spotify",
    "Apple Music",
    "videoclips",
    "merch El Toni",
  ],
  authors: [{ name: "EL TONI", url: SITE_URL }],
  creator: "EL TONI",
  publisher: "EL TONI",
  applicationName: "EL TONI",
  category: "music",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: {
    canonical: "/",
    languages: { "es-ES": "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "EL TONI",
    title: "EL TONI — Urbano latino | Escucha TU VENENO",
    description:
      "Escucha TU VENENO y toda la discografía de EL TONI en Spotify, Apple Music y YouTube.",
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "EL TONI — Urbano latino" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EL TONI — Urbano latino | Escucha TU VENENO",
    description: "Escucha TU VENENO y toda la discografía de EL TONI.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1310",
  colorScheme: "dark",
};

/** "2:18" → ISO-8601 duration "PT2M18S" (Schema.org VideoObject.duration). */
function isoDuration(mmss: string): string {
  const [m, s] = mmss.split(":").map(Number);
  return `PT${m}M${s}S`;
}

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/**
 * One JSON-LD @graph describing the whole entity model so search engines (and
 * Google's AI Overviews) can build rich results: the WebSite, the artist as a
 * MusicGroup with every social profile + full discography (MusicRecording), each
 * videoclip as a VideoObject, and the merch as a Product/Offer.
 */
function StructuredData() {
  const artistId = `${SITE_URL}/#artist`;
  const releaseByTitle = new Map(site.releases.map((r) => [r.title, r]));

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: site.artist,
      inLanguage: "es-ES",
      publisher: { "@id": artistId },
    },
    {
      "@type": ["MusicGroup", "Person"],
      "@id": artistId,
      name: site.artist,
      alternateName: "El Toni",
      url: SITE_URL,
      image: abs(OG_IMAGE),
      description: site.about,
      genre: "Urbano latino",
      foundingLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "ES" } },
      sameAs: [
        site.socials.spotify,
        site.socials.appleMusic,
        site.socials.youtube,
        site.socials.instagram,
        site.socials.tiktok,
      ],
      track: site.releases.map((r) => ({
        "@type": "MusicRecording",
        name: r.title,
        url: r.spotify,
        sameAs: [r.spotify, r.appleMusic],
        image: abs(r.cover),
        datePublished: r.date,
        inLanguage: "es",
        byArtist: { "@id": artistId },
      })),
    },
    ...site.videos.map((v) => {
      const rel = releaseByTitle.get(v.title);
      return {
        "@type": "VideoObject",
        name: `${v.title} — ${site.artist}`,
        description: `Videoclip oficial de "${v.title}" de ${site.artist}.`,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
        contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        duration: isoDuration(v.duration),
        ...(rel ? { uploadDate: rel.date } : {}),
        author: { "@id": artistId },
      };
    }),
    ...site.merch.products.map((p) => ({
      "@type": "Product",
      name: p.name,
      description: p.desc,
      image: abs(p.image),
      brand: { "@id": artistId },
      offers: {
        "@type": "Offer",
        price: p.price.amount,
        priceCurrency: p.price.currency,
        availability: p.buyUrl
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
        url: p.buyUrl || SITE_URL,
      },
    })),
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: site.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const data = { "@context": "https://schema.org", "@graph": graph };
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
        <StructuredData />
        <AudioProvider>
          <main>{children}</main>
        </AudioProvider>
        <Grain />
        <ScrollDepth />
        <Analytics />
        <SpeedInsights />
        <MarketingTags />
      </body>
    </html>
  );
}

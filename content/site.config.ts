/**
 * Single source of truth for all site content (build spec §6.1).
 * UI copy is Spanish; keep brand facts (URLs, names) verbatim from spec §2.
 */

export type Platform = "spotify" | "appleMusic" | "youtube";

export interface MerchProduct {
  id: string;
  name: string;
  desc: string;
  image: string;
  price: { amount: number; currency: string };
  sizes: string[];
  buyUrl: string; // empty -> "Próximamente" + email capture
  worldPos: { x: number; y: number }; // placement in the tavern game
}

export const site = {
  artist: "EL TONI",
  lang: "es",
  email: "eltonihidalgo@gmail.com",
  descriptor: "Urbano latino",
  heroHook: "Música para las cosas que no dijiste a tiempo.",
  lyricAccent: "Así es la vida, sí",

  nav: [
    { label: "Música", href: "#escuchar" },
    { label: "Sobre mí", href: "#sobre-mi" },
    { label: "Tienda", href: "#tienda" },
  ],

  socials: {
    youtube: "https://www.youtube.com/@eltonihidalgo",
    spotify: "https://open.spotify.com/artist/7s116O3u1tP0IaPaRWhDcH",
    appleMusic: "https://music.apple.com/es/artist/el-toni/1841115561",
    instagram: "https://www.instagram.com/eltonihidalgo/",
    tiktok: "https://www.tiktok.com/@eltonihidalgo",
  },

  latest: {
    title: "TU VENENO",
    label: "Nuevo single",
    cover: "/assets/covers/tu-veneno.jpg",
    releaseDate: "2026-06-05",
    spotifyEmbed: "", // optional Spotify embed id/url
    links: {
      spotify: "https://open.spotify.com/artist/7s116O3u1tP0IaPaRWhDcH",
      appleMusic: "https://music.apple.com/es/artist/el-toni/1841115561",
      youtube: "https://www.youtube.com/@eltonihidalgo",
    },
  },

  /** Singles 2025–2026, newest first. covers fetched from Apple Music. */
  releases: [
    { title: "TU VENENO", date: "2026-06-05", cover: "/assets/covers/tu-veneno.jpg" },
    { title: "NO VOLVERÉ", date: "2026-04-15", cover: "/assets/covers/no-volvere.jpg" },
    { title: "VOLVER A EMPEZAR", date: "2026-03-24", cover: "/assets/covers/volver-a-empezar.jpg" },
    { title: "QUIÉN SERÁ MI AMOR?", date: "2026-02-13", cover: "/assets/covers/quien-sera-mi-amor.jpg" },
    { title: "BAJO LA LLUVIA", date: "2025-12-10", cover: "/assets/covers/bajo-la-lluvia.jpg" },
    { title: "BAILO AL DOLOR", date: "2025-11-14", cover: "/assets/covers/bailo-al-dolor.jpg" },
    { title: "EL QUE BAJABA EL CIELO", date: "2025-10-17", cover: "/assets/covers/el-que-bajaba-el-cielo.jpg" },
    { title: "LA QUE ME QUIERE OLVIDAR", date: "2025-10-03", cover: "/assets/covers/la-que-me-quiere-olvidar.jpg" },
  ],

  topTracks: [
    "TU VENENO",
    "VOLVER A EMPEZAR",
    "QUIÉN SERÁ MI AMOR?",
    "NO VOLVERÉ",
    "LA QUE ME QUIERE OLVIDAR",
  ],

  ambientAudio: "/assets/audio/ambient.mp3", // [AMBIENT_AUDIO_FILE] not yet delivered

  photos: {
    heroRed: "/assets/photos/eltoni-red.jpg", // cream suit on deep red
    lightBg: "/assets/photos/eltoni-light.jpg", // cream suit on light bg
  },

  about:
    "Soy Toni. Hago canciones urbanas para las cosas que cuesta decir: el desamor, la duda, lo que se queda dentro. Sin postureo, sin promesas vacías. Solo letras honestas y melodías que se quedan contigo.",

  video: null as null | { src: string; poster: string; youtube: string },

  merch: {
    products: [
      {
        id: "lqmqo-tee",
        name: 'Camiseta "LA QUE ME QUIERE OLVIDAR"',
        desc: "Camiseta blanca oversize. Caballo negro, letras rojas, firma de El Toni.",
        image: "/assets/merch/lqmqo-tee.jpg",
        price: { amount: 20, currency: "EUR" },
        sizes: ["S", "M", "L", "XL"],
        buyUrl: "", // [PRODUCT_URL_LQMQO] none yet -> "Próximamente"
        worldPos: { x: 0.62, y: 0.42 },
      },
    ] as MerchProduct[],
  },
} as const;

export type Site = typeof site;

export const PLATFORM_LABELS: Record<Platform, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtube: "YouTube",
};

export function formatPrice(p: { amount: number; currency: string }): string {
  return p.currency === "EUR" ? `${p.amount} €` : `${p.amount} ${p.currency}`;
}

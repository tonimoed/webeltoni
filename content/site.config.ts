/**
 * Single source of truth for all site content (build spec §6.1).
 * UI copy is Spanish; keep brand facts (URLs, names) verbatim from spec §2.
 */

export type Platform = "spotify" | "appleMusic" | "youtube";

export interface MerchProduct {
  id: string;
  name: string;
  desc: string;
  image: string; // flat product image (used in the ProductPopup card)
  image3d?: string; // 3D render, hung/backlit in the store display case
  price: { amount: number; currency: string };
  sizes: string[];
  buyUrl: string; // empty -> "Próximamente" + email capture
}

export const site = {
  artist: "EL TONI",
  lang: "es",
  // Canonical production origin — used for metadata, canonical URLs, sitemap,
  // robots and JSON-LD. Keep this in sync with the live Vercel domain.
  url: "https://eltoni-landing.vercel.app",
  email: "eltonihidalgo@gmail.com",
  descriptor: "Urbano latino",
  heroHook: "Música para las cosas que no dijiste a tiempo.",
  lyricAccent: "Así es la vida, sí",

  nav: [
    { label: "Música", href: "#escuchar" },
    { label: "Vídeos", href: "#videos" },
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

  /**
   * Singles 2025–2026, newest first. Covers + 30s preview audio fetched from
   * the Apple/iTunes catalog (artist id 1841115561). `preview` powers the
   * in-page player; these CDN URLs can rotate — re-run the iTunes lookup if a
   * track stops playing.
   */
  /**
   * `spotify`/`appleMusic` are per-track "save/listen" deep links so the player
   * can link straight to the chosen song. Apple links come from the iTunes
   * catalog (artist 1841115561); Spotify links resolved via the Spotify
   * connector. NO VOLVERÉ didn't surface a unique Spotify track (title collides
   * with classics) → falls back to the artist page until a direct link exists.
   */
  // `focus` = vertical % for the player's blurred cover-background crop, tuned
  // per cover so the face/subject sits well in the wide, short card (0 = top).
  releases: [
    { title: "TU VENENO", date: "2026-06-05", cover: "/assets/covers/tu-veneno.jpg", focus: 20, preview: "/assets/previews/tu-veneno.m4a", spotify: "https://open.spotify.com/track/5R3NwtIR7rF7LerqrzOXyF", appleMusic: "https://music.apple.com/es/album/tu-veneno/6773625019?i=6773625023" },
    { title: "NO VOLVERÉ", date: "2026-04-15", cover: "/assets/covers/no-volvere.jpg", focus: 12, preview: "/assets/previews/no-volvere.m4a", spotify: "https://open.spotify.com/artist/7s116O3u1tP0IaPaRWhDcH", appleMusic: "https://music.apple.com/es/album/no-volvere/1890757145?i=1890757146" },
    { title: "VOLVER A EMPEZAR", date: "2026-03-24", cover: "/assets/covers/volver-a-empezar.jpg", focus: 32, preview: "/assets/previews/volver-a-empezar.m4a", spotify: "https://open.spotify.com/track/1wIsaucdssLz2h26X1vyrJ", appleMusic: "https://music.apple.com/es/album/volver-a-empezar/1884183947?i=1884183948" },
    { title: "QUIÉN SERÁ MI AMOR?", date: "2026-02-13", cover: "/assets/covers/quien-sera-mi-amor.jpg", focus: 30, preview: "/assets/previews/quien-sera-mi-amor.m4a", spotify: "https://open.spotify.com/track/2l0xZt3ELWg8seYeHaxKBQ", appleMusic: "https://music.apple.com/es/album/quien-sera-mi-amor/1874718022?i=1874718023" },
    { title: "BAJO LA LLUVIA", date: "2025-12-10", cover: "/assets/covers/bajo-la-lluvia.jpg", focus: 20, preview: "/assets/previews/bajo-la-lluvia.m4a", spotify: "https://open.spotify.com/track/6qBnCA5sHZLTDu7b4UruoZ", appleMusic: "https://music.apple.com/es/album/bajo-la-lluvia/1857677413?i=1857677414" },
    { title: "BAILO AL DOLOR", date: "2025-11-14", cover: "/assets/covers/bailo-al-dolor.jpg", focus: 26, preview: "/assets/previews/bailo-al-dolor.m4a", spotify: "https://open.spotify.com/track/3TNPPtkMyPWbAWCK04X7YD", appleMusic: "https://music.apple.com/es/album/bailo-al-dolor/1851816192?i=1851816193" },
    { title: "EL QUE BAJABA EL CIELO", date: "2025-10-17", cover: "/assets/covers/el-que-bajaba-el-cielo.jpg", focus: 50, preview: "/assets/previews/el-que-bajaba-el-cielo.m4a", spotify: "https://open.spotify.com/track/2GnXbJwdly2kkflO10yTNH", appleMusic: "https://music.apple.com/es/album/el-que-bajaba-el-cielo/1843566050?i=1843566051" },
    { title: "LA QUE ME QUIERE OLVIDAR", date: "2025-10-03", cover: "/assets/covers/la-que-me-quiere-olvidar.jpg", focus: 32, preview: "/assets/previews/la-que-me-quiere-olvidar.m4a", spotify: "https://open.spotify.com/track/7GcD3KVfWq59BmqVHESkX2", appleMusic: "https://music.apple.com/es/album/la-que-me-quiere-olvidar/1841325334?i=1841325337" },
  ],

  topTracks: [
    "TU VENENO",
    "VOLVER A EMPEZAR",
    "QUIÉN SERÁ MI AMOR?",
    "NO VOLVERÉ",
    "LA QUE ME QUIERE OLVIDAR",
  ],

  ambientAudio: "/assets/audio/ambient.mp3", // [AMBIENT_AUDIO_FILE] not yet delivered
  heroVideo: "/assets/video/videoclip.mp4", // delivered — plays in the hero (muted autoplay)

  photos: {
    heroRed: "/assets/photos/eltoni-red.jpg", // cream suit on deep red
    lightBg: "/assets/photos/eltoni-light.jpg", // cream suit on light bg
  },

  about:
    "Soy Toni. Hago canciones urbanas para las cosas que cuesta decir: el desamor, la duda, lo que se queda dentro. Sin postureo, sin promesas vacías. Solo letras honestas y melodías que se quedan contigo.",

  /**
   * YouTube videoclips, newest first — page 3 (#videos) embeds them via the
   * official YouTube IFrame player so every play counts as a real YouTube view.
   * `id` is the 11-char watch id; thumbnails derive from i.ytimg.com (no local
   * assets). Verified by scraping youtube.com/@eltonihidalgo on 2026-06-17;
   * "(Audio)"-only uploads (NO VOLVERÉ, VOLVER A EMPEZAR) are excluded because
   * they have no videoclip.
   */
  videos: [
    { title: "TU VENENO", id: "miKw8CN1IYI", duration: "2:18" },
    { title: "QUIÉN SERÁ MI AMOR?", id: "-lkFO-chQFU", duration: "2:51" },
    { title: "BAJO LA LLUVIA", id: "koi0k2vF2EA", duration: "3:43" },
    { title: "BAILO AL DOLOR", id: "3ayE9pAh3fE", duration: "2:37" },
    { title: "EL QUE BAJABA EL CIELO", id: "f07HUWxRZ60", duration: "2:23" },
    { title: "LA QUE ME QUIERE OLVIDAR", id: "BX9JjUbrLwA", duration: "2:56" },
  ],

  merch: {
    products: [
      {
        id: "lqmqo-tee",
        name: 'Camiseta "LA QUE ME QUIERE OLVIDAR"',
        desc: "Camiseta blanca oversize. Caballo negro, letras rojas, firma de El Toni.",
        image: "/assets/merch/lqmqo-tee.jpg",
        image3d: "/assets/merch/lqmqo-tee-3d.jpg",
        price: { amount: 20, currency: "EUR" },
        sizes: ["S", "M", "L", "XL"],
        buyUrl: "", // [PRODUCT_URL_LQMQO] none yet -> "Próximamente"
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

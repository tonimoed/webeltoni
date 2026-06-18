# SEO & SEM — EL TONI

Qué se ha implementado en el código para posicionamiento orgánico (SEO) y
preparación de campañas de pago (SEM), y qué queda en tus manos (off-code).

## SEO técnico / on-page (activo)

- **Dominio canónico unificado** en `content/site.config.ts → site.url`
  (`https://eltoni-landing.vercel.app`). Antes metadata, sitemap y robots
  apuntaban a un dominio inexistente (`eltoni.vercel.app`) → canonical roto.
- **Metadata enriquecida** (`app/layout.tsx`): título con plantilla `%s — EL TONI`,
  descripción con keywords, `keywords`, `authors/creator/publisher`, `category`,
  `alternates` con canonical + hreflang `es-ES` / `x-default`, Open Graph y
  Twitter Card `summary_large_image`, `robots` con `max-image-preview:large`.
- **Open Graph image 1200×630** (`public/og.jpg`, generada con
  `scripts/make-og.mjs`). La anterior era vertical 1064×1600 (mala para tarjetas
  y anuncios).
- **Datos estructurados JSON-LD** (`@graph`) para rich results y Google AIO:
  `WebSite`, `MusicGroup`/`Person` con TODOS los perfiles (`sameAs`) y la
  discografía como `MusicRecording`, cada videoclip como `VideoObject`
  (con `duration` y `uploadDate`), y la camiseta como `Product`/`Offer`
  (`PreOrder`).
- **sitemap.xml** (`app/sitemap.ts`) y **robots.txt** (`app/robots.ts`) con el
  dominio correcto, `lastModified`, `host` y `Disallow: /api/`.
- Páginas legales (`/privacidad`, `/cookies`) en `noindex`.

## SEM / paid media (preparado, requiere activación)

`components/MarketingTags.tsx` carga GA4, Google Ads y Meta Pixel **solo** si
defines sus IDs (ver `.env.example`). Sin IDs no carga nada ni escribe cookies
publicitarias. Las conversiones que ya dispara la web (`lib/analytics.ts → track`:
`listen_click`, `follow_click`, `merch_buy_click`, `contact_submit`, `email_click`)
se reenvían automáticamente a `gtag()` y `fbq()` cuando los tags están activos.

Para activarlo:

1. En Vercel → Settings → Environment Variables (Production), añade los que uses:
   `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`.
2. **GDPR (estás en la UE):** añade un banner de consentimiento de cookies y
   actualiza `/cookies` antes de activar los píxeles (hoy la política dice
   "sin cookies publicitarias", que es cierto mientras estén apagados).
3. Define las conversiones en Google Ads / Meta usando los eventos reenviados.

## Off-code (tu trabajo de marketing, según el temario)

- **Keyword research**: marca + canciones ("EL TONI", "TU VENENO letra",
  "El Toni urbano latino"), informacionales y de descubrimiento.
- **Autoridad/backlinks**: directorios de artistas, prensa musical, perfiles
  enlazando a la web.
- **Google Search Console + GA4**: dar de alta el dominio, enviar el sitemap,
  monitorizar impresiones/posición.
- **Contenido enriquecido**: si en el futuro hay blog/notas de prensa, son
  páginas indexables nuevas (la landing es una sola URL).

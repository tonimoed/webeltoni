# Propuesta SEM — EL TONI

Plan de publicidad de pago para `eltoni-landing.vercel.app`, alineado con el
temario (captar vs generar demanda, embudo TOFU/MOFU/BOFU, métricas CPL/CPA,
audiencias frías/lookalike/remarketing). Honesto y sin humo: para un artista
emergente, **el peso está en Meta/TikTok/YouTube (generar demanda), no en Google
Search**, porque la gente no "busca para comprar" música.

## 1. Objetivo y modelo de conversión

No hay venta directa, así que la "conversión" es el oyente. Jerarquía de valor:

1. **Stream / save** en Spotify–Apple (clic `listen_click`).
2. **Seguidor** en las plataformas (`follow_click`).
3. **View** de videoclip (YouTube).
4. **Lead de merch** (email "avísame" → futura venta).

Todos estos eventos ya se disparan en la web (`lib/analytics.ts`) y se reenvían a
Google/Meta cuando actives los tags. KPI rey: **coste por oyente/seguidor**, no CPA
de venta.

## 2. Captar vs generar demanda (mapa de plataformas)

| Función | Plataforma | Uso para EL TONI |
|---|---|---|
| **Captar** (búsqueda activa) | Google Search | Solo **defensa de marca**: "el toni", "tu veneno el toni". Barato y protege la marca. |
| **Captar** | YouTube (búsqueda) | Anuncios sobre búsquedas de canciones/artistas afines. |
| **Generar** (descubrimiento) | **Instagram/Facebook Reels** | Núcleo del plan: vídeo vertical → streams/seguidores. |
| **Generar** | **TikTok Ads** | Donde vive el público de urbano latino. Clips de 9–15 s. |
| **Generar** | YouTube (in-stream/Shorts) | Trailers de videoclip. |
| **Generar** | Spotify Ad Studio | Audio + cover hacia el perfil del artista. |

## 3. Google Ads (captura — presupuesto mínimo)

Campaña **Search · Marca** (protección, CPC bajo):

- **Grupo "Marca"**: `el toni`, `el toni cantante`, `el toni urbano latino`,
  `el toni musica`.
- **Grupo "Canciones"**: por single — `tu veneno el toni`, `no volveré el toni`,
  `quién será mi amor el toni`, … (+ `letra`, `videoclip` como modificadores).
- Concordancia: frase y exacta. Negativas: `letra completa pdf`, nombres de otros
  artistas homónimos.
- **Copys (RSA)** — titulares: "EL TONI — Escucha TU VENENO" · "Urbano latino desde
  España" · "Todos los singles en Spotify". Descripción: "Música honesta sobre el
  amor y el desamor. Escúchalo ya." → destino: `eltoni-landing.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=marca`.
- Extensiones: enlaces de sitio (Música, Vídeos, Tienda), texto destacado.

> Campaña **YouTube** opcional (captura+descubrimiento): vídeo in-stream con el
> videoclip de TU VENENO, audiencias afines a reggaetón/urbano latino.

## 4. Meta Ads (generación — núcleo del plan)

Embudo en 3 etapas (TOFU/MOFU/BOFU):

- **TOFU — frío (alcance/reproducciones de vídeo):** Reels 9–15 s con el hook más
  fuerte del videoclip. Audiencias por **intereses**: oyentes de artistas afines
  de urbano latino, reggaetón, géneros tristes/desamor; España 18–34. Objetivo:
  ThruPlay / reproducciones.
- **MOFU — interacción → lookalike:** crea **Audiencias Similares (Lookalike 1–3%)**
  a partir de quienes vieron ≥50% del vídeo y de los visitantes web (Pixel).
  Objetivo: tráfico a la web / clics a Spotify.
- **BOFU — remarketing (conversión):** impacta a visitantes de la web y engagers
  con "Escucha el single completo" / "Sígueme en Spotify". Objetivo: tráfico/
  conversiones (`listen_click`, `follow_click`).

**Ideas de copy** (voz EL TONI — directo, sin hype):
- "Para las cosas que no dijiste a tiempo. Escucha TU VENENO."
- "Sin postureo. Solo letras honestas. — EL TONI"
- "Si te gusta el urbano con verdad, esto es para ti."

**Ideas visuales:** vertical 9:16, primeros 2 s = gancho (cara + frase de la
canción sobreimpresa), subtítulos quemados, cierre con CTA + logo. Probar 3–4
hooks por canción (A/B).

## 5. Medición (ya implementado en la web)

- **GA4 + Google Ads + Meta Pixel**: `components/MarketingTags.tsx`, se activan con
  `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
  (ver `.env.example`).
- **Conversiones reenviadas** a `gtag()`/`fbq()`: `listen_click`, `follow_click`,
  `merch_buy_click`, `contact_submit`, `email_click`.
- **UTMs**: usa los parámetros de la tabla anterior; Vercel Analytics ya registra
  origen/medio.
- Define en Google Ads / Meta las conversiones personalizadas con esos nombres de
  evento.

## 6. Presupuesto orientativo (mensual)

| Escenario | Meta/TikTok | Google Search (marca) | YouTube | Total |
|---|---|---|---|---|
| Arranque | 150 € | 30 € | — | **180 €** |
| Crecimiento | 400 € | 50 € | 150 € | **600 €** |
| Lanzamiento single | 800 € | 60 € | 300 € | **1.160 €** |

Regla del temario: el coste por resultado debe ser sostenible frente al valor del
oyente (recurrencia de streams + merch futuro). Empieza pequeño, mata lo que no
convierte, escala lo que sí.

## 7. Pasos para activar

1. **Search Console + GA4**: dar de alta `eltoni-landing.vercel.app`, enviar el
   sitemap, conectar GA4.
2. **IDs en Vercel** (Production): `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`,
   `NEXT_PUBLIC_META_PIXEL_ID`.
3. **GDPR**: añadir banner de consentimiento de cookies y actualizar `/cookies`
   antes de encender los píxeles (estás en la UE).
4. Crear las campañas según §3–§4 y conectar las conversiones de §5.
5. Lanzar con presupuesto de arranque, revisar a 7–14 días, iterar creatividades.

## 8. Calendario de test (primeras 2 semanas)

- Semana 1: TOFU Meta (3 hooks de TU VENENO) + Search Marca. Medir CTR, CPV, coste
  por clic a Spotify.
- Semana 2: construir Lookalike de los que vieron vídeo, abrir BOFU remarketing,
  pausar el 50% peor de creatividades.

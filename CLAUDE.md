# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page, conversion-focused landing site for the Latin-urban artist **EL TONI**, deployed on Vercel. Two goals in priority order: drive music streaming (Spotify/Apple/YouTube), then sell merch via an explorable canvas mini-game ("La Taberna"). Music-first, immersive: ambient audio toggle, oversized editorial type over photography, cream/red palette.

UI copy is **Spanish**; code, comments, and commits in **English**.

## Commands

Package manager is **pnpm** (Node 20+). `corepack enable` needs admin on this machine — pnpm is installed at user level instead.

```bash
pnpm dev                       # dev server (Turbopack) on :3000
pnpm build                     # production build (also runs full TypeScript typecheck)
pnpm start -p 3100             # serve the prod build
pnpm lint                      # eslint

pnpm test                      # unit + e2e
pnpm test:unit                 # vitest (pure logic only)
pnpm test:e2e                  # playwright across mobile/tablet/desktop

pnpm exec vitest run tests/unit/items.test.ts            # single unit file
pnpm exec playwright test --project=desktop              # one viewport project
pnpm exec playwright test tests/e2e/game.spec.ts -g "keyboard"   # single e2e test

node scripts/make-signature.mjs   # regenerate transparent signature PNGs from WEB/ source

vercel deploy --prod --yes     # deploy to production (account: tonimoed → eltoni-landing.vercel.app)
```

E2E uses Playwright's `webServer` to `pnpm build && pnpm start` on :3100. `reuseExistingServer` is on locally (set `CI=1` to force a fresh build, e.g. after changing source). Only Chromium is installed, so the `tablet` project runs Chromium with a tablet viewport, **not** WebKit. The interactive `playwright-cli` skill must always run **headed** (user preference).

## Architecture

**Everything flows from `content/site.config.ts`.** It is the single source of truth for all copy, releases, streaming/social URLs, the latest single, and merch. The merch game is fully data-driven from `site.merch.products` (`worldPos` places items in the tavern, `buyUrl` empty → "Próximamente" + email capture). To add a release, social link, or product, edit this file only.

**Tailwind v4 is CSS-first.** Design tokens live in `app/globals.css` under `@theme` (colors `--color-cream/ink/red/red-deep/amber/muted`, font-size tokens `--text-hero`/`--text-h2`), **not** in a `tailwind.config.ts` (there is none). Use the generated utilities directly: `bg-cream`, `text-ink`, `text-hero`, `text-h2`. Gotcha: `text-[var(--text-hero)]` is parsed by Tailwind as a *color*, not a length, and silently leaves font-size at 16px — always use the `text-hero`/`text-h2` theme utilities instead.

**Audio is a single element coordinated by a pure bus.** `lib/audio-bus.ts` is a dependency-free pub/sub that guarantees exclusive playback (`duck`/`unduck`/`pause`/`resume`). `components/audio/AudioProvider.tsx` owns the one ambient `<audio>` (muted by default, audible only after interaction, pauses on `document.hidden`, `preload="none"` for Save-Data) and subscribes to the bus. A future video player calls `duck()`/`pause()` so only one source is ever audible — `VisualMoment.tsx` already wires this for when `site.video` is set.

**The merch game is isolated and deferred.** `game/` contains a framework-agnostic canvas engine (`engine.ts` — RAF loop, camera, warm light-reveal, keyboard/click/joystick input, proximity detection) plus `world.ts`/`player.ts` (programmatic castizo tavern, no sprite assets needed) and `items.ts` (pure proximity math, unit-tested). `game/TavernGame.tsx` is the React wrapper; `game/index.ts` re-exports it for dynamic import. `components/sections/MerchTavern.tsx` gates the whole thing: it `next/dynamic`-imports the game and mounts it **only when `#tienda` scrolls into view**, so the game never ships in the initial bundle or LCP path. Users with `prefers-reduced-motion` / `prefers-reduced-data` / Save-Data, or if the canvas fails to init, get `game/fallback.tsx` instead — **buying must always work without the game**. The engine exposes itself as `window.__tavern` for E2E/debugging. The render loop pauses off-screen and on `document.hidden`.

**Page composition.** `app/layout.tsx` sets `lang="es"`, fonts (Anton display + Inter body via `next/font`), JSON-LD `MusicGroup`, SEO/OG metadata, skip link, `AudioProvider`, `StickyNav`, analytics. `app/page.tsx` composes the nine sections in fixed order (`components/sections/`). Each section owns its `id` anchor; `html { scroll-padding-top }` offsets the sticky nav on anchor jumps.

**Analytics** go through `lib/analytics.ts → track()`, which forwards to `@vercel/analytics` and no-ops safely when unavailable (SSR/blocked/dev). All conversion events (`listen_click`, `follow_click`, `merch_buy_click`, `game_start`, etc.) route through it.

**Contact** posts to `app/api/contact/route.ts`, a validating Resend-ready stub. Resend is intentionally not wired (no `RESEND_API_KEY`) — the form is mailto-first and the route returns `{ deferred: true }`; enable the marked block when a key exists.

## Conventions & gotchas

- **Brand signature**: `WEB/logo amarillo.jpeg` (the artist's handwriting, pale-yellow on white, in the parent workspace) is keyed to transparent PNGs in `public/assets/brand/` by `scripts/make-signature.mjs` (alpha from the blue-channel deficit; cream + red-deep tints). Used to sign the About bio and the footer. The delivered `WEB/LOGO.jpeg` is white-on-white and unusable as a primary logo — the nav uses a typographic wordmark.
- **Pending assets have graceful fallbacks, not breakage**: missing `public/assets/audio/ambient.mp3` (toggle present but inert), no tee `buyUrl` ("Próximamente" + email capture), no primary logo SVG (wordmark/signature). Don't "fix" these by removing the fallbacks.
- **Single covers** in `public/assets/covers/` were fetched from the public iTunes lookup API (artist id `1841115561`).
- **Test 404 tolerances**: the home E2E ignores 404s for the pending ambient audio and `/_vercel/*` beacons (those only resolve once deployed on Vercel) — keep that filter when editing the test.

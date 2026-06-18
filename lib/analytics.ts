/**
 * Thin analytics wrapper (build spec §6.3).
 * Forwards to @vercel/analytics if present; always no-ops safely otherwise.
 */
import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEvent =
  | { name: "listen_click"; props: { platform: string; track?: string } }
  | { name: "follow_click"; props: { platform: string } }
  | { name: "merch_click"; props: { product: string } }
  | { name: "store_visit"; props: { product: string } }
  | { name: "game_start"; props?: Record<string, never> }
  | { name: "merch_item_view"; props: { product: string } }
  | { name: "merch_buy_click"; props: { product: string } }
  | { name: "audio_toggle"; props: { state: "on" | "off" } }
  | { name: "contact_submit"; props?: Record<string, never> }
  | { name: "email_click"; props?: Record<string, never> }
  | { name: "scroll_depth"; props: { depth: 25 | 50 | 75 | 100 } };

/** Conversion events worth reporting to the ad platforms (SEM optimisation). */
const CONVERSIONS = new Set<AnalyticsEvent["name"]>([
  "listen_click",
  "follow_click",
  "merch_buy_click",
  "contact_submit",
  "email_click",
]);

export function track(
  name: AnalyticsEvent["name"],
  props?: Record<string, string | number | boolean | null>,
): void {
  const payload = props ?? {};
  try {
    vercelTrack(name, payload);
  } catch {
    // analytics unavailable (SSR, blocked, dev) — no-op
  }

  // Forward to Google (gtag) and Meta (fbq) when their tags are loaded
  // (see components/MarketingTags). Silently no-ops when they aren't.
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      gtag?: (...a: unknown[]) => void;
      fbq?: (...a: unknown[]) => void;
    };
    try {
      w.gtag?.("event", name, payload);
      if (CONVERSIONS.has(name)) w.fbq?.("trackCustom", name, payload);
    } catch {
      // ad tags unavailable — no-op
    }
  }

  if (process.env.NODE_ENV !== "production") {
    // helps E2E + manual debugging
    // eslint-disable-next-line no-console
    console.debug("[track]", name, payload);
  }
}

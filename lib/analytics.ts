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

export function track(
  name: AnalyticsEvent["name"],
  props?: Record<string, string | number | boolean | null>,
): void {
  try {
    vercelTrack(name, props ?? {});
  } catch {
    // analytics unavailable (SSR, blocked, dev) — no-op
  }
  if (process.env.NODE_ENV !== "production") {
    // helps E2E + manual debugging
    // eslint-disable-next-line no-console
    console.debug("[track]", name, props ?? {});
  }
}

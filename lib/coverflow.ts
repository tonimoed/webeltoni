/**
 * Shared coverflow math for the page-2 cover deck (MusicSection) and the page-3
 * video deck (VideoGallery). Pure functions so they can seed the first paint and
 * be driven by a requestAnimationFrame loop. `N` is the number of items.
 */

/** Signed distance from `center` to slot `i`, wrapped to the nearest copy. */
export function wrapDelta(i: number, center: number, n: number): number {
  let d = i - center;
  d = ((d % n) + n + n / 2) % n;
  return d - n / 2;
}

/**
 * Coverflow placement for an item whose wrapped distance from the front is `d`.
 * Pure so it can seed the initial render too — items are spread on first paint
 * and never stack, even if rAF is paused (e.g. the tab loads in the background).
 */
export function placement(d: number, spread: number, offsetX: number, baseY = -170) {
  const ad = Math.abs(d);
  const tx = d * spread + offsetX;
  const ty = ad * 20 + baseY; // gentle arc; baseY shifts the whole deck vertically
  const rotY = Math.max(-52, Math.min(52, -d * 26)); // coverflow turn
  const scale = Math.max(0.5, 1 - ad * 0.13);
  const opacity = Math.max(0, 1 - ad * 0.24);
  return {
    transform: `translate3d(${tx}px, ${ty}px, 0) rotateY(${rotY}deg) scale(${scale})`,
    opacity,
    zIndex: 100 - Math.round(ad * 10),
    filter: `brightness(${Math.max(0.5, 1 - ad * 0.14)})`,
  };
}

// Seed layout for first paint (before width is known); rAF corrects on frame 1.
export const SEED_SPREAD = 168;
export const SEED_OFFSET = -150;

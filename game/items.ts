import { site, type MerchProduct } from "@/content/site.config";

/** Logical tavern world size in game units. */
export const WORLD = { width: 1600, height: 1000 } as const;

export interface GameItem {
  product: MerchProduct;
  x: number; // world units
  y: number;
  radius: number; // proximity trigger radius (world units)
}

/** Build interactive items from merch data (data-driven, spec §8). */
export function buildItems(): GameItem[] {
  return site.merch.products.map((product) => ({
    product,
    x: product.worldPos.x * WORLD.width,
    y: product.worldPos.y * WORLD.height,
    radius: 130,
  }));
}

/** Pure proximity test — unit-tested independently of the canvas. */
export function isWithinRadius(
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number,
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= radius * radius;
}

/** Returns the first item the point is within range of, or null. */
export function itemInRange(
  point: { x: number; y: number },
  items: GameItem[],
): GameItem | null {
  for (const item of items) {
    if (isWithinRadius(point, item, item.radius)) return item;
  }
  return null;
}

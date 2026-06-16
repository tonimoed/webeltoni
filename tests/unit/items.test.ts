import { describe, expect, it } from "vitest";
import {
  WORLD,
  buildItems,
  isWithinRadius,
  itemInRange,
} from "@/game/items";

describe("game items / proximity", () => {
  it("builds items from merch data at world coordinates", () => {
    const items = buildItems();
    expect(items.length).toBeGreaterThan(0);
    const tee = items.find((i) => i.product.id === "lqmqo-tee");
    expect(tee).toBeDefined();
    expect(tee!.x).toBeGreaterThan(0);
    expect(tee!.x).toBeLessThanOrEqual(WORLD.width);
    expect(tee!.product.price.amount).toBe(20);
  });

  it("isWithinRadius is true inside and false outside", () => {
    const a = { x: 100, y: 100 };
    expect(isWithinRadius(a, { x: 150, y: 100 }, 60)).toBe(true);
    expect(isWithinRadius(a, { x: 200, y: 100 }, 60)).toBe(false);
    // exactly on the boundary counts as within
    expect(isWithinRadius(a, { x: 160, y: 100 }, 60)).toBe(true);
  });

  it("itemInRange returns the nearby item or null", () => {
    const items = buildItems();
    const tee = items[0];
    expect(itemInRange({ x: tee.x, y: tee.y }, items)).toBe(tee);
    expect(itemInRange({ x: -9999, y: -9999 }, items)).toBeNull();
  });
});

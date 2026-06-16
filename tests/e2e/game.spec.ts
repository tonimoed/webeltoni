import { test, expect } from "@playwright/test";

type TavernHandle = {
  getActiveItem: () => { product: { id: string } } | null;
  isRunning: () => boolean;
};
declare global {
  interface Window {
    __tavern?: TavernHandle;
  }
}

test.describe("merch tavern game", () => {
  test("game is NOT mounted initially, loads only when #tienda enters view", async ({ page }) => {
    await page.goto("/");
    // before scrolling: no canvas, no engine
    expect(await page.locator("[data-testid=tavern-canvas]").count()).toBe(0);
    expect(await page.evaluate(() => typeof window.__tavern)).toBe("undefined");

    await page.locator("#tienda").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("tavern-canvas")).toBeVisible();
    await expect.poll(() => page.evaluate(() => typeof window.__tavern)).toBe("object");
  });

  test("keyboard movement opens the product popup with the right product + price", async ({ page }) => {
    await page.goto("/");
    await page.locator("#tienda").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("tavern-canvas")).toBeVisible();
    await expect.poll(() => page.evaluate(() => typeof window.__tavern)).toBe("object");

    await page.getByTestId("tavern-canvas").click();
    await page.keyboard.down("d");
    await page.keyboard.down("w");
    await expect
      .poll(
        () => page.evaluate(() => window.__tavern?.getActiveItem()?.product.id ?? null),
        { timeout: 6000 },
      )
      .toBe("lqmqo-tee");
    await page.keyboard.up("d");
    await page.keyboard.up("w");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("product-price")).toHaveText("20 €");

    // Comprar -> Próximamente + email capture (no store URL yet)
    await dialog.getByRole("button", { name: "Comprar" }).click();
    await expect(dialog.getByText(/Próximamente/)).toBeVisible();
    await expect(dialog.locator("input[type=email]")).toBeVisible();
  });

  test("render loop pauses when the section scrolls off-screen", async ({ page }) => {
    await page.goto("/");
    await page.locator("#tienda").scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => typeof window.__tavern)).toBe("object");
    await expect.poll(() => page.evaluate(() => window.__tavern?.isRunning() ?? false)).toBe(true);

    await page.locator("#inicio").scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.evaluate(() => window.__tavern?.isRunning() ?? true))
      .toBe(false);
  });

  test("reduced-motion users get the accessible fallback and can buy without the game", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#tienda").scrollIntoViewIfNeeded();

    // no canvas in lite mode
    expect(await page.locator("[data-testid=tavern-canvas]").count()).toBe(0);
    const fallback = page.getByTestId("merch-fallback");
    await expect(fallback).toBeVisible();
    await expect(fallback.getByTestId("product-price").first()).toHaveText("20 €");

    await fallback.getByRole("button", { name: "Comprar" }).first().click();
    await expect(page.getByText(/Próximamente/)).toBeVisible();
  });
});

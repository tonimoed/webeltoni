import { test, expect } from "@playwright/test";

test.describe("store (#tienda — frozen cases)", () => {
  test("shows 5 cases; the centre one has the product", async ({ page }) => {
    await page.goto("/#tienda");
    const cases = page.locator("#tienda .store-hotspot");
    await expect(cases).toHaveCount(5);
    await expect(page.getByTestId("case-product")).toBeVisible();
    // four locked cases + the product case
    await expect(page.locator("#tienda .store-hotspot--locked")).toHaveCount(4);
  });

  test("centre case opens the product → price + Próximamente email capture", async ({ page }) => {
    await page.goto("/#tienda");
    await page.getByTestId("case-product").click();

    const dialog = page.getByTestId("product-lqmqo-tee");
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("product-price")).toHaveText("20 €");

    await page.getByRole("button", { name: "Comprar" }).click();
    await expect(dialog.getByText(/Próximamente/)).toBeVisible();
    await expect(page.locator("#waitlist-lqmqo-tee")).toBeVisible();
  });

  test("empty case shows a transient Próximamente toast", async ({ page }, testInfo) => {
    // side cases sit off-screen under the full-bleed crop on narrow viewports
    test.skip(testInfo.project.name !== "desktop", "side cases only fully visible on desktop");
    await page.goto("/#tienda");
    await page.getByTestId("case-locked-0").click();
    await expect(page.getByTestId("store-soon-toast")).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

const NAV = [
  { label: "Música", hash: "#escuchar" },
  { label: "Vídeos", hash: "#videos" },
  { label: "Tienda", hash: "#tienda" },
];

test.describe("navigation", () => {
  for (const item of NAV) {
    test(`nav "${item.label}" scrolls to ${item.hash} and updates the hash`, async ({ page }) => {
      await page.goto("/");

      const menuBtn = page.locator("[aria-controls=mobile-menu]");
      if (await menuBtn.isVisible()) await menuBtn.click();

      await page.locator("header").getByRole("link", { name: item.label }).click();
      await expect(page).toHaveURL(new RegExp(`${item.hash}$`));

      // smooth scroll may still be animating — poll until the section is in view
      await expect
        .poll(() =>
          page.locator(item.hash).evaluate((el) => {
            const r = el.getBoundingClientRect();
            return r.top < window.innerHeight && r.bottom > 0;
          }),
        )
        .toBe(true);
    });
  }

  test("#videos shows the videoclip deck and a YouTube subscribe link", async ({ page }) => {
    await page.goto("/");
    await page.locator("#videos").scrollIntoViewIfNeeded();
    // at least one video card in the coverflow
    await expect(page.locator("#videos .p2-vid-card").first()).toBeVisible();
    // subscribe button points at the sub_confirmation URL
    const sub = page.locator("#videos a", { hasText: "Suscríbete" });
    await expect(sub).toHaveAttribute("href", /sub_confirmation=1/);
  });
});

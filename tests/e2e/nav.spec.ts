import { test, expect } from "@playwright/test";

const NAV = [
  { label: "Música", hash: "#escuchar" },
  { label: "Sobre mí", hash: "#sobre-mi" },
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

  test("#momento reveals on scroll (IntersectionObserver)", async ({ page }) => {
    await page.goto("/");
    const moment = page.getByTestId("visual-moment");
    await page.locator("#momento").scrollIntoViewIfNeeded();
    await expect.poll(() => moment.getAttribute("data-visible")).toBe("true");
    await expect(moment).toHaveClass(/is-visible/);
  });
});

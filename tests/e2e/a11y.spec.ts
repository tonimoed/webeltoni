import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("accessibility (axe-core)", () => {
  test("no critical violations on load", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toHaveLength(0);
  });

  test("no critical violations with the mobile menu open", async ({ page }) => {
    await page.goto("/");
    const menuBtn = page.locator("[aria-controls=mobile-menu]");
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await expect(page.locator("#mobile-menu")).toBeVisible();
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toHaveLength(0);
  });

  test("skip link and audio toggle are keyboard reachable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const firstFocus = await page.evaluate(() => document.activeElement?.textContent);
    expect(firstFocus).toMatch(/Saltar al contenido/);

    // audio toggle is a real button with an accessible name
    await expect(page.getByTestId("audio-toggle")).toHaveAttribute("aria-label", /música/i);
  });
});

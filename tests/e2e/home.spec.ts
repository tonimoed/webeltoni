import { test, expect } from "@playwright/test";

const SOCIALS = {
  youtube: "https://www.youtube.com/@eltonihidalgo",
  spotify: "https://open.spotify.com/artist/7s116O3u1tP0IaPaRWhDcH",
  appleMusic: "https://music.apple.com/es/artist/el-toni/1841115561",
};

test.describe("home", () => {
  test("loads with h1, logo, sections and no console errors", async ({ page }) => {
    const pageErrors: string[] = [];
    const notFound: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));
    page.on("response", (r) => {
      const u = new URL(r.url());
      // only our own (localhost) 404s matter; external CDNs (e.g. the YouTube
      // thumbnail maxresdefault.jpg, which 404s for some clips and falls back to
      // hqdefault) are not our concern.
      const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
      if (r.status() === 404 && local) notFound.push(u.pathname);
    });

    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);

    await expect(page.locator("h1")).toHaveText(/EL TONI/);
    await expect(page.getByRole("link", { name: /EL TONI/ }).first()).toBeVisible();

    for (const id of ["inicio", "escuchar", "videos", "tienda"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    // hero LCP image present
    await expect(page.locator("#inicio img").first()).toBeVisible();

    // Known-OK 404s when not running on Vercel: the pending ambient audio file,
    // and the Vercel Analytics / Speed-Insights beacons (live only once deployed).
    const unexpected404 = notFound.filter(
      (p) => p !== "/assets/audio/ambient.mp3" && !p.startsWith("/_vercel/"),
    );
    expect(unexpected404, `unexpected 404s: ${unexpected404.join(", ")}`).toHaveLength(0);
    expect(pageErrors, pageErrors.join("\n")).toHaveLength(0);
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });

  test("primary CTA is visible above the fold and routes to #escuchar", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Escuchar ahora" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#escuchar");
  });

  test("streaming links are verbatim, open in new tab with rel=noopener", async ({ page }) => {
    await page.goto("/");
    for (const url of Object.values(SOCIALS)) {
      const link = page.locator(`a[href="${url}"]`).first();
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("ambient audio exists and starts muted; toggle flips state", async ({ page }) => {
    await page.goto("/");
    const audio = page.getByTestId("ambient-audio");
    await expect(audio).toHaveCount(1);
    expect(await audio.evaluate((el: HTMLAudioElement) => el.muted)).toBe(true);

    const toggle = page.getByTestId("audio-toggle");
    await expect(toggle).toHaveAttribute("aria-label", /música/i);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

});

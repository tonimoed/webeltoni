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
      if (r.status() === 404) notFound.push(new URL(r.url()).pathname);
    });

    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);

    await expect(page.locator("h1")).toHaveText(/EL TONI/);
    await expect(page.locator("header a", { hasText: "EL TONI" }).first()).toBeVisible();

    for (const id of ["inicio", "escuchar", "plataformas", "sobre-mi", "momento", "tienda", "seguir", "contacto"]) {
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

  test("mailto is present and correct", async ({ page }) => {
    await page.goto("/");
    const mailto = page.getByTestId("mailto-link");
    await expect(mailto).toHaveAttribute("href", /^mailto:eltonihidalgo@gmail\.com/);
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

  test("contact form: shows validation errors then a mocked success", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contacto").scrollIntoViewIfNeeded();

    // empty submit -> client validation errors
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.locator("#err-email")).toBeVisible();

    // mock the provider endpoint
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );

    await page.fill("#c-nombre", "Ana");
    await page.fill("#c-email", "ana@example.com");
    await page.fill("#c-mensaje", "Hola, quiero info de booking.");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/Gracias/)).toBeVisible();
  });
});

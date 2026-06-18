// Build the 1200×630 social card (public/og.jpg) used for Open Graph / Twitter
// and as the artist image in JSON-LD. Cinematic store scene + dark gradient +
// wordmark/tagline. Re-run after changing the source scene or the copy.
//
//   node scripts/make-og.mjs

import sharp from "sharp";

const W = 1200;
const H = 630;
const SRC = "public/assets/photos/store-scene.webp";
const OUT = "public/og.jpg";

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000005" stop-opacity="0.10"/>
      <stop offset="0.5" stop-color="#000005" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#000005" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="80" y="438" font-family="Arial Black, Arial, sans-serif" font-weight="900"
        font-size="156" letter-spacing="2" fill="#F3ECE0">EL TONI</text>
  <text x="86" y="492" font-family="Arial, sans-serif" font-size="34" fill="#F3ECE0"
        opacity="0.94">Urbano latino · Escucha TU VENENO</text>
  <text x="86" y="556" font-family="Arial, sans-serif" font-size="25" font-weight="700"
        letter-spacing="3" fill="#E8A33D">SPOTIFY · APPLE MUSIC · YOUTUBE</text>
</svg>`);

const base = await sharp(SRC).resize(W, H, { fit: "cover", position: "top" }).toBuffer();

await sharp(base)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT);

console.log(`og.jpg written (${W}x${H})`);

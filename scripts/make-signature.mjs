// Extracts EL TONI's handwritten signature from the delivered JPEG
// (pale-yellow strokes on white) into trimmed transparent PNGs, recolored
// for use on dark and on cream backgrounds.
//
// Keying: white has full blue (255); the yellow strokes are blue-deficient,
// so alpha = (255 - blue) cleanly isolates the ink with smooth anti-aliasing.
import sharp from "sharp";

const SRC = "../WEB/logo amarillo.jpeg";
const OUT_DIR = "public/assets/brand";

const tints = {
  "signature-cream": [243, 236, 224], // --cream, for dark / red sections
  "signature-ink": [110, 13, 16], // --red-deep, for cream sections
};

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

for (const [name, [tr, tg, tb]] of Object.entries(tints)) {
  const out = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const b = data[p * channels + 2];
    let a = (255 - b) * 2.4; // amplify the blue deficit into opacity
    a = Math.max(0, Math.min(255, a));
    out[p * 4] = tr;
    out[p * 4 + 1] = tg;
    out[p * 4 + 2] = tb;
    out[p * 4 + 3] = a;
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 10 })
    .png()
    .toFile(`${OUT_DIR}/${name}.png`);
  console.log(`wrote ${OUT_DIR}/${name}.png`);
}

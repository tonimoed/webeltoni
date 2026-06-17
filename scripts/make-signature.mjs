// Extracts EL TONI's handwritten signature from the delivered JPEG
// (pale-yellow strokes on white) into tightly-cropped transparent PNGs,
// recolored for use on dark and on cream backgrounds.
//
// Keying: white has full blue (255); the yellow strokes are blue-deficient,
// so alpha = (255 - blue) cleanly isolates the ink with smooth anti-aliasing.
// We compute the alpha bounding box once and extract the SAME tight region for
// every tint, so both PNGs share identical, padding-free dimensions.
import sharp from "sharp";

const SRC = "../WEB/logo amarillo.jpeg";
const OUT_DIR = "public/assets/brand";
const ALPHA_FLOOR = 24; // ignore faint anti-alias halo when finding the crop

const tints = {
  "signature-cream": [243, 236, 224], // --cream, for dark / red sections
  "signature-ink": [110, 13, 16], // --red-deep, for cream sections
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// build the alpha mask and its bounding box
const alpha = new Uint8Array(width * height);
let minX = width, minY = height, maxX = 0, maxY = 0;
for (let p = 0; p < width * height; p++) {
  const b = data[p * channels + 2];
  const a = Math.max(0, Math.min(255, (255 - b) * 2.4));
  alpha[p] = a;
  if (a >= ALPHA_FLOOR) {
    const x = p % width;
    const y = (p / width) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}
const pad = 8;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad);
maxY = Math.min(height - 1, maxY + pad);
const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

for (const [name, [tr, tg, tb]] of Object.entries(tints)) {
  const out = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const sp = (minY + y) * width + (minX + x);
      const dp = (y * cropW + x) * 4;
      out[dp] = tr;
      out[dp + 1] = tg;
      out[dp + 2] = tb;
      out[dp + 3] = alpha[sp];
    }
  }
  await sharp(out, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile(`${OUT_DIR}/${name}.png`);
  console.log(`wrote ${OUT_DIR}/${name}.png (${cropW}x${cropH})`);
}

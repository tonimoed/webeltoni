import { WORLD } from "./items";

/**
 * Programmatic castizo tavern (build spec §8 asset fallback).
 * Warm and lit — amber wood, tiled floor, bar, bottle shelves, hanging lamp,
 * a red neon "EL TONI" sign. No external tileset required.
 */

const PALETTE = {
  floorA: "#6b4a2a",
  floorB: "#5c3f24",
  wall: "#3a2412",
  wallTrim: "#2a1a0d",
  wood: "#7a4a1e",
  woodDark: "#5a3414",
  bottleGlass: "#3b6b4a",
  amber: "#e8a33d",
  neon: "#ff3b4e",
  cream: "#f3ece0",
};

export function drawWorld(ctx: CanvasRenderingContext2D) {
  const { width, height } = WORLD;

  // back wall
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, width, height * 0.32);

  // wainscot trim
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, height * 0.3, width, 18);

  // tiled floor (checker)
  const tile = 80;
  for (let y = height * 0.32; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const even = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }

  // bottle shelves on the back wall
  drawShelf(ctx, width * 0.06, height * 0.08, 6);
  drawShelf(ctx, width * 0.72, height * 0.08, 5);

  // neon sign
  drawNeon(ctx, width / 2, height * 0.13, "EL TONI");

  // the bar (lower-left), where the player roams in front of
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(width * 0.05, height * 0.62, width * 0.34, height * 0.12);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(width * 0.05, height * 0.62, width * 0.34, 12);

  // a couple of barrels (right side)
  drawBarrel(ctx, width * 0.84, height * 0.7);
  drawBarrel(ctx, width * 0.9, height * 0.78);
}

function drawShelf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bottles: number,
) {
  const w = 220;
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x, y, w, 12);
  ctx.fillRect(x, y + 70, w, 12);
  for (let i = 0; i < bottles; i++) {
    const bx = x + 12 + i * ((w - 24) / bottles);
    ctx.fillStyle = i % 2 === 0 ? PALETTE.bottleGlass : "#7a3b2a";
    ctx.fillRect(bx, y - 46, 18, 46);
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(bx + 5, y - 58, 8, 14);
  }
}

function drawBarrel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = PALETTE.wood;
  ctx.beginPath();
  ctx.ellipse(x, y, 46, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 44, y - 20);
  ctx.lineTo(x + 44, y - 20);
  ctx.moveTo(x - 44, y + 20);
  ctx.lineTo(x + 44, y + 20);
  ctx.stroke();
}

function drawNeon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
) {
  ctx.save();
  ctx.font = "700 64px 'Arial Narrow', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = PALETTE.neon;
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#ff8a96";
  ctx.fillText(text, cx, cy);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = PALETTE.neon;
  ctx.lineWidth = 2;
  ctx.strokeText(text, cx, cy);
  ctx.restore();
}

export { PALETTE };

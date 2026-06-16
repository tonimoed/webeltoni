import { WORLD } from "./items";
import { PALETTE } from "./world";

export interface Player {
  x: number;
  y: number;
  speed: number; // world units / second
  facing: 1 | -1;
  step: number; // walk-cycle accumulator
}

export function createPlayer(): Player {
  return {
    x: WORLD.width * 0.45,
    y: WORLD.height * 0.62,
    speed: 320,
    facing: 1,
    step: 0,
  };
}

/**
 * Advance the player by a direction vector (already normalized to [-1,1]).
 * Clamps to the walkable area. dt in seconds.
 */
export function movePlayer(
  p: Player,
  dir: { x: number; y: number },
  dt: number,
): void {
  const len = Math.hypot(dir.x, dir.y);
  if (len > 0.01) {
    const nx = dir.x / len;
    const ny = dir.y / len;
    p.x += nx * p.speed * dt;
    p.y += ny * p.speed * dt;
    if (Math.abs(nx) > 0.05) p.facing = nx > 0 ? 1 : -1;
    p.step += p.speed * dt;
  }
  const margin = 60;
  p.x = Math.max(margin, Math.min(WORLD.width - margin, p.x));
  p.y = Math.max(WORLD.height * 0.36, Math.min(WORLD.height - margin, p.y));
}

export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player) {
  const bob = Math.sin(p.step / 22) * 4;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 40, 26, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.scale(p.facing, 1);

  // body (cream suit, nod to the artist's look)
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(-16, -18, 32, 46);
  // head
  ctx.fillStyle = "#e8c9a0";
  ctx.beginPath();
  ctx.arc(0, -32, 14, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = "#241a12";
  ctx.beginPath();
  ctx.arc(0, -36, 14, Math.PI, Math.PI * 2);
  ctx.fill();
  // red detail
  ctx.fillStyle = PALETTE.neon;
  ctx.fillRect(-4, -18, 8, 24);

  ctx.restore();
}

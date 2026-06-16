import { WORLD, buildItems, itemInRange, type GameItem } from "./items";
import { drawWorld, PALETTE } from "./world";
import { createPlayer, movePlayer, drawPlayer, type Player } from "./player";

export interface EngineCallbacks {
  onProximity: (item: GameItem | null) => void;
  onItemTap?: (item: GameItem) => void;
  onStart?: () => void;
}

const MAX_DPR = 2;
const VISIBLE_WORLD_HEIGHT = 760; // world units shown vertically

/**
 * Canvas tavern engine (build spec §8). Framework-agnostic: a React wrapper
 * owns mounting. Pauses its RAF loop when off-screen or document.hidden.
 */
export class TavernEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: EngineCallbacks;

  private player: Player = createPlayer();
  private items: GameItem[] = buildItems();
  private images = new Map<string, HTMLImageElement>();

  private keys = new Set<string>();
  private joy = { x: 0, y: 0 };
  private target: { x: number; y: number } | null = null;
  private currentItem: GameItem | null = null;

  private raf = 0;
  private last = 0;
  private running = false;
  private scale = 1;
  private cam = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.cb = cb;
    this.preloadImages();
    this.bind();
    this.resize();
  }

  private preloadImages() {
    for (const it of this.items) {
      const img = new Image();
      img.src = it.product.image;
      this.images.set(it.product.id, img);
    }
  }

  // ---- input -------------------------------------------------------------
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      this.keys.add(k);
      this.target = null;
      e.preventDefault();
    }
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());

  private onPointerDown = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    // screen -> world
    const world = {
      x: this.cam.x + (sx - rect.width / 2) / this.scale,
      y: this.cam.y + (sy - rect.height / 2) / this.scale,
    };
    // tapping an item directly opens it (spec §8)
    const tapped = itemInRange(world, this.items);
    if (tapped) {
      this.cb.onItemTap?.(tapped);
      return;
    }
    this.target = world;
  };

  /** External joystick vector, components in [-1, 1]. */
  setJoystick(x: number, y: number) {
    this.joy.x = x;
    this.joy.y = y;
    if (x !== 0 || y !== 0) this.target = null;
  }

  private keyboardDir() {
    let x = 0;
    let y = 0;
    if (this.keys.has("a") || this.keys.has("arrowleft")) x -= 1;
    if (this.keys.has("d") || this.keys.has("arrowright")) x += 1;
    if (this.keys.has("w") || this.keys.has("arrowup")) y -= 1;
    if (this.keys.has("s") || this.keys.has("arrowdown")) y += 1;
    return { x, y };
  }

  private bind() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("resize", this.resize);
  }

  private unbind() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("resize", this.resize);
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scale = h / VISIBLE_WORLD_HEIGHT;
  };

  // ---- loop --------------------------------------------------------------
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.cb.onStart?.();
    this.raf = requestAnimationFrame(this.frame);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resume() {
    if (this.running) return;
    this.last = performance.now();
    this.start();
  }

  destroy() {
    this.pause();
    this.unbind();
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    // resolve movement direction: keyboard > joystick > click target
    const kb = this.keyboardDir();
    let dir = { x: 0, y: 0 };
    if (kb.x !== 0 || kb.y !== 0) {
      dir = kb;
    } else if (this.joy.x !== 0 || this.joy.y !== 0) {
      dir = { ...this.joy };
    } else if (this.target) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      if (Math.hypot(dx, dy) < 8) {
        this.target = null;
      } else {
        dir = { x: dx, y: dy };
      }
    }
    movePlayer(this.player, dir, dt);

    // camera follows, clamped to world
    const viewW = this.canvas.clientWidth / this.scale;
    const viewH = this.canvas.clientHeight / this.scale;
    this.cam.x = clamp(this.player.x, viewW / 2, WORLD.width - viewW / 2);
    this.cam.y = clamp(this.player.y, viewH / 2, WORLD.height - viewH / 2);

    // proximity → popup callback (only fires on change)
    const hit = itemInRange(this.player, this.items);
    if (hit !== this.currentItem) {
      this.currentItem = hit;
      this.cb.onProximity(hit);
    }
  }

  private render() {
    const ctx = this.ctx;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;

    ctx.fillStyle = "#1a1310";
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    // world transform: center camera
    ctx.translate(cw / 2, ch / 2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.cam.x, -this.cam.y);

    drawWorld(ctx);
    this.drawItems(ctx);
    drawPlayer(ctx, this.player);

    ctx.restore();

    this.drawLighting(ctx, cw, ch);
  }

  private drawItems(ctx: CanvasRenderingContext2D) {
    const t = performance.now() / 1000;
    for (const it of this.items) {
      const bob = Math.sin(t * 2 + it.x) * 8;
      const active = it === this.currentItem;

      // glow
      const glow = ctx.createRadialGradient(it.x, it.y + bob, 8, it.x, it.y + bob, 90);
      glow.addColorStop(0, active ? "rgba(255,80,90,0.55)" : "rgba(232,163,61,0.5)");
      glow.addColorStop(1, "rgba(232,163,61,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(it.x - 100, it.y + bob - 100, 200, 200);

      // product thumbnail (or placeholder)
      const img = this.images.get(it.product.id);
      const size = 110;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, it.x - size / 2, it.y + bob - size / 2, size, size);
      } else {
        ctx.fillStyle = PALETTE.cream;
        ctx.fillRect(it.x - size / 2, it.y + bob - size / 2, size, size);
      }

      // label
      ctx.fillStyle = active ? "#fff" : PALETTE.amber;
      ctx.font = "600 22px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(active ? "¡Pulsa para ver!" : "Merch", it.x, it.y + bob + size / 2 + 26);
    }
  }

  /** Warm light reveal: amber glow around the player + soft edge vignette. */
  private drawLighting(ctx: CanvasRenderingContext2D, cw: number, ch: number) {
    const px = cw / 2 + (this.player.x - this.cam.x) * this.scale;
    const py = ch / 2 + (this.player.y - this.cam.y) * this.scale;

    // warm player halo (lighten)
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    const halo = ctx.createRadialGradient(px, py, 20, px, py, 320);
    halo.addColorStop(0, "rgba(255,210,140,0.9)");
    halo.addColorStop(1, "rgba(255,210,140,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // gentle edge vignette (warm, not black fog)
    const vig = ctx.createRadialGradient(
      cw / 2,
      ch / 2,
      Math.min(cw, ch) * 0.35,
      cw / 2,
      ch / 2,
      Math.max(cw, ch) * 0.75,
    );
    vig.addColorStop(0, "rgba(26,19,16,0)");
    vig.addColorStop(1, "rgba(26,19,16,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);
  }

  /** test/debug helper */
  getPlayer() {
    return this.player;
  }
  isRunning() {
    return this.running;
  }
  getActiveItem() {
    return this.currentItem;
  }
}

function clamp(v: number, min: number, max: number) {
  if (max < min) return (min + max) / 2;
  return Math.max(min, Math.min(max, v));
}

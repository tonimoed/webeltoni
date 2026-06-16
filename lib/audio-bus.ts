/**
 * Audio coordination bus (build spec §6.2).
 * Guarantees only ONE audio source is audible at a time. The ambient
 * AudioProvider subscribes; future video players call duck()/pause().
 *
 * Pure module with no React/DOM deps so it can be unit-tested directly.
 */

type DuckListener = (ducked: boolean) => void;
type PauseListener = (paused: boolean) => void;

const duckListeners = new Set<DuckListener>();
const pauseListeners = new Set<PauseListener>();

let ducked = false;
let pausedExternally = false;

export function onDuck(fn: DuckListener): () => void {
  duckListeners.add(fn);
  return () => duckListeners.delete(fn);
}

export function onPause(fn: PauseListener): () => void {
  pauseListeners.add(fn);
  return () => pauseListeners.delete(fn);
}

/** Lower ambient audio (e.g. while a video plays). */
export function duck(): void {
  if (ducked) return;
  ducked = true;
  duckListeners.forEach((fn) => fn(true));
}

export function unduck(): void {
  if (!ducked) return;
  ducked = false;
  duckListeners.forEach((fn) => fn(false));
}

/** Fully stop ambient audio (exclusive playback). */
export function pause(): void {
  if (pausedExternally) return;
  pausedExternally = true;
  pauseListeners.forEach((fn) => fn(true));
}

export function resume(): void {
  if (!pausedExternally) return;
  pausedExternally = false;
  pauseListeners.forEach((fn) => fn(false));
}

export function isDucked(): boolean {
  return ducked;
}

export function isPausedExternally(): boolean {
  return pausedExternally;
}

/** test-only: reset module state between unit tests */
export function __resetAudioBus(): void {
  ducked = false;
  pausedExternally = false;
  duckListeners.clear();
  pauseListeners.clear();
}

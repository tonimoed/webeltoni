"use client";

/**
 * Persistent, always-visible, keyboard-reachable ambient-audio toggle.
 * Labeled for screen readers (build spec §6.2 / §10.5).
 */
import { useAudio } from "./AudioProvider";

export function AudioToggle() {
  const { enabled, toggle, nowPlaying } = useAudio();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Activar o silenciar música"
      aria-pressed={enabled}
      data-testid="audio-toggle"
      title={enabled ? `Sonando: ${nowPlaying}` : "Activar música"}
      className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-ink/70 text-cream backdrop-blur-sm transition-colors hover:bg-red focus-visible:bg-red"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {enabled ? "🔊" : "🔇"}
      </span>
    </button>
  );
}

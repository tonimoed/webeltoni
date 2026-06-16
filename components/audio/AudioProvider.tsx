"use client";

/**
 * Single ambient <audio> element + global mute state (build spec §6.2).
 * - muted by default; attempts muted autoplay
 * - becomes audible only after first user interaction; choice kept per session
 * - pauses on document.hidden
 * - obeys the audio-bus duck()/pause() API (exclusive playback)
 * - respects Save-Data: does not preload, loads on first interaction
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { site } from "@/content/site.config";
import { onDuck, onPause } from "@/lib/audio-bus";
import { track } from "@/lib/analytics";

interface AudioState {
  /** user wants sound on */
  enabled: boolean;
  /** the track name currently loaded (for "ahora suena: …") */
  nowPlaying: string;
  toggle: () => void;
}

const AudioContext = createContext<AudioState | null>(null);

const SESSION_KEY = "eltoni:audio";
const DUCK_VOLUME = 0.12;
const FULL_VOLUME = 0.55;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const duckedRef = useRef(false);
  const pausedRef = useRef(false);

  // restore session preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "on") {
      setEnabled(true);
    }
  }, []);

  // drive the actual element from state
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.loop = true;
    el.volume = duckedRef.current ? DUCK_VOLUME : FULL_VOLUME;

    if (enabled && !pausedRef.current) {
      el.muted = false;
      el.play().catch(() => {
        /* autoplay/interaction policy may block — toggle will retry */
      });
    } else {
      el.muted = true;
    }
  }, [enabled]);

  // pause when the tab is hidden, resume when visible (if still enabled)
  useEffect(() => {
    function onVisibility() {
      const el = audioRef.current;
      if (!el) return;
      if (document.hidden) {
        el.pause();
      } else if (enabled && !pausedRef.current) {
        el.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled]);

  // audio-bus: duck / exclusive-pause coordination
  useEffect(() => {
    const offDuck = onDuck((d) => {
      duckedRef.current = d;
      const el = audioRef.current;
      if (el) el.volume = d ? DUCK_VOLUME : FULL_VOLUME;
    });
    const offPause = onPause((p) => {
      pausedRef.current = p;
      const el = audioRef.current;
      if (!el) return;
      if (p) {
        el.pause();
      } else if (enabled) {
        el.play().catch(() => {});
      }
    });
    return () => {
      offDuck();
      offPause();
    };
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.sessionStorage.setItem(SESSION_KEY, next ? "on" : "off");
      } catch {
        /* storage unavailable */
      }
      track("audio_toggle", { state: next ? "on" : "off" });
      return next;
    });
  }, []);

  return (
    <AudioContext.Provider
      value={{ enabled, nowPlaying: site.latest.title, toggle }}
    >
      {/* preload="none" honours Save-Data and keeps the file off the LCP path */}
      <audio
        ref={audioRef}
        src={site.ambientAudio}
        preload="none"
        muted
        aria-hidden="true"
        data-testid="ambient-audio"
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    // safe fallback so components never crash outside the provider
    return { enabled: false, nowPlaying: site.latest.title, toggle: () => {} };
  }
  return ctx;
}

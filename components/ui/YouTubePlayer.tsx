"use client";

import { useEffect, useRef } from "react";

/**
 * YouTube playback via the official IFrame Player API (not a bare autoplay
 * iframe). A freshly-inserted `<iframe autoplay=1>` often won't start — the user
 * gesture doesn't carry to the cross-origin frame, so the clip loads paused.
 * Creating a `YT.Player` and calling `playVideo()` on `onReady` reliably starts
 * playback (and `enablejsapi` lets us drive it). Used by the page-3 gallery.
 */

type YTPlayer = { playVideo: () => void; destroy: () => void };
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export function YouTubePlayer({
  videoId,
  title,
  className = "",
}: {
  videoId: string;
  title?: string;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YTPlayer | null = null;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      player = new YT.Player(mountRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => e.target.playVideo(),
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
    };
  }, [videoId]);

  return (
    <div className={className} title={title}>
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}

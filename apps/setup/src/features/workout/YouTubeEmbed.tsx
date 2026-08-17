import { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play } from 'lucide-react';

// Interim exercise demonstration while imagePath has no real illustration/
// video assets yet (see Exercise.videoId's own comment in domain/
// exercise.ts). 16:9 always, so it drops into the same slot as the gray
// placeholder box it replaces without a layout shift between exercises
// that have one and those that don't.
//
// YouTube's embed only offers an all-or-nothing `controls` toggle — there's
// no way to show just play/pause and hide the scrubber/volume/settings/etc.
// individually. To get that (explicit product decision), this loads the
// real IFrame Player API (JS), not a plain <iframe src="...">, renders it
// with controls:0, and layers two custom buttons on top: play/pause (talks
// to the player instance) and expand (the standard Fullscreen API on the
// wrapper, not YouTube's own fullscreen button — that's part of the
// native control bar this is hiding).

// Minimal shape of the IFrame Player API this component actually uses —
// the real API surface is much larger; no @types/youtube dependency in
// this project, so this is hand-typed to just what's called below.
interface YouTubePlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
}

interface YouTubePlayerConstructorConfig {
  videoId: string;
  host?: string;
  playerVars?: Record<string, number>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

interface YouTubeIframeApi {
  Player: new (element: HTMLElement, config: YouTubePlayerConstructorConfig) => YouTubePlayerInstance;
  PlayerState: { PLAYING: number };
}

declare global {
  interface Window {
    YT?: YouTubeIframeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;
function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  // YT.Player replaces its target element with an <iframe> — it doesn't
  // just render into it. Handing it a React-managed ref (from wrapperRef
  // itself) breaks under StrictMode's dev-only double-invoke: the first
  // effect run's player replaces the div with an iframe, then its cleanup
  // destroys that player/iframe, leaving the *second* run's ref pointing
  // at a node no longer in the document. Creating a plain DOM div here —
  // outside React's reconciliation — and mounting/unmounting it by hand
  // sidesteps that entirely; each effect run gets its own fresh target.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setPlaying(false);
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const target = document.createElement('div');
    target.className = 'absolute inset-0';
    wrapper.appendChild(target);

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;
      const YT = window.YT;
      playerRef.current = new YT.Player(target, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { controls: 0, rel: 0, modestbranding: 1, fs: 0, playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (event) => setPlaying(event.data === YT.PlayerState.PLAYING),
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      target.remove();
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapperRef.current?.requestFullscreen();
    }
  };

  return (
    <div
      ref={wrapperRef}
      role="group"
      aria-label={`${title} — exercise demonstration`}
      className="bg-foreground relative aspect-video w-full overflow-hidden rounded-lg [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full fullscreen:rounded-none"
    >
      {ready && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-space-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="bg-foreground/60 hover:bg-foreground/80 flex size-9 items-center justify-center rounded-full text-white transition-colors"
          >
            {playing ? (
              <Pause className="size-4" fill="currentColor" stroke="none" />
            ) : (
              <Play className="size-4" fill="currentColor" stroke="none" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Expand video"
            className="bg-foreground/60 hover:bg-foreground/80 flex size-9 items-center justify-center rounded-full text-white transition-colors"
          >
            <Maximize className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

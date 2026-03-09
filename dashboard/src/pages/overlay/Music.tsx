import { useState, useRef, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { api } from "@/hooks/useApi";
import type { SongRequestData } from "@/types/api";

interface SongProgress {
  percent: number;
  currentTime: number;
  duration: number;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

let ytApiLoaded = false;
let ytApiReady = false;
const ytReadyCallbacks: (() => void)[] = [];

function loadYTApi(onReady: () => void) {
  if (ytApiReady) { onReady(); return; }
  ytReadyCallbacks.push(onReady);
  if (ytApiLoaded) return;
  ytApiLoaded = true;
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytReadyCallbacks.forEach((cb) => cb());
    ytReadyCallbacks.length = 0;
  };
}

export function MusicOverlay() {
  const [song, setSong] = useState<SongRequestData | null>(null);
  const [progress, setProgress] = useState(0);
  const [iframeVisible, setIframeVisible] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    api.get<SongRequestData[]>("/api/queue").then((queue) => {
      setSong(queue[0] ?? null);
    }).catch(() => {});
  }, []);

  useSocketEvent<{ queue: SongRequestData[] }>("songRequest", (data) => {
    if (data.queue[0]) setSong(data.queue[0]);
  });

  useSocketEvent<SongRequestData[]>("songPlayNext", (data) => {
    setSong(data[0] ?? null);
    setProgress(0);
  });

  // Allow server/other clients to push progress too
  useSocketEvent<SongProgress>("currentSongProgress", (data) => {
    setProgress(data.percent ?? 0);
  });

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const current = player.getCurrentTime();
      const duration = player.getDuration();
      if (!duration) return;
      const percent = (current / duration) * 100;
      setProgress(percent);
      socket.emit("currentSongProgress", { percent, currentTime: current, duration });
    }, 1000);
  }, [socket, stopProgressTimer]);

  // Build/rebuild YT Player whenever song changes
  useEffect(() => {
    if (!song) {
      playerRef.current?.destroy();
      playerRef.current = null;
      stopProgressTimer();
      return;
    }

    loadYTApi(() => {
      if (!playerContainerRef.current) return;

      playerRef.current?.destroy();
      stopProgressTimer();

      // YT.Player needs a real DOM element, give it a fresh div each time
      const el = document.createElement("div");
      playerContainerRef.current.innerHTML = "";
      playerContainerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId: song.id,
        playerVars: { autoplay: 1, controls: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              startProgressTimer();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              stopProgressTimer();
              setProgress(0);
              socket.emit("songEnded");
            } else {
              stopProgressTimer();
            }
          },
        },
      });
    });

    return () => {
      stopProgressTimer();
    };
  }, [song?.id, socket, startProgressTimer, stopProgressTimer]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        p: 2,
        background: "transparent",
        fontFamily: "'DM Sans', sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* YT Player container — always mounted, toggled visible */}
      <Box
        ref={playerContainerRef}
        sx={{
          position: "absolute",
          bottom: iframeVisible ? 90 : 1,
          left: iframeVisible ? 16 : 0,
          width: iframeVisible ? 320 : 1,
          height: iframeVisible ? 180 : 1,
          opacity: iframeVisible ? 1 : 0,
          borderRadius: iframeVisible ? "12px" : 0,
          overflow: "hidden",
          border: iframeVisible ? "1px solid rgba(255,255,255,0.15)" : "none",
          boxShadow: iframeVisible ? "0 8px 32px rgba(0,0,0,0.6)" : "none",
          pointerEvents: iframeVisible ? "auto" : "none",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "& iframe": { width: "100% !important", height: "100% !important" },
        }}
      />

      {song && (
        <Box
          onClick={() => setIframeVisible((v) => !v)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            p: "10px 14px",
            width: 320,
            height: 76,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            pointerEvents: "auto",
            outline: iframeVisible
              ? "1px solid rgba(124,58,237,0.6)"
              : "1px solid transparent",
            animation: "musicIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transition: "outline 0.2s ease",
            "@keyframes musicIn": {
              from: { opacity: 0, transform: "translateY(20px) scale(0.92)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
          }}
        >
          <Box
            component="img"
            src={song.thumbnail}
            alt="thumbnail"
            sx={{
              width: 56,
              height: 56,
              borderRadius: "99999px",
              objectFit: "cover",
              flexShrink: 0,
              animation: "spin 8s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                fontSize: 13,
                fontWeight: 800,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song.title}
            </Box>
            <Box
              sx={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song.author}
            </Box>
            <Box sx={{ fontSize: 10, color: "#7C3AED", mt: 0.25 }}>
              ♪ {song.requestedBy}
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
              transition: "width 1s linear",
            }}
          />
        </Box>
      )}
    </Box>
  );
}
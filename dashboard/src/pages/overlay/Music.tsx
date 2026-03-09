import { useState, useRef } from "react";
import { Box } from "@mui/material";
import { useSocketEvent } from "@/hooks/useSocket";
import type { SongRequestData } from "@/types/api";

interface SongProgress {
  percent: number;
  currentTime: number;
  duration: number;
}

export function MusicOverlay() {
  const [song, setSong] = useState<SongRequestData | null>(null);
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useSocketEvent<{ queue: SongRequestData[] }>("songRequest", (data) => {
    if (data.queue[0]) setSong(data.queue[0]);
  });

  useSocketEvent<SongRequestData[]>("songPlayNext", (data) => {
    setSong(data[0] ?? null);
    setProgress(0);
  });

  useSocketEvent<SongProgress>("currentSongProgress", (data) => {
    setProgress(data.percent ?? 0);
  });

  const youtubeId = song?.id;

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
      {/* Hidden YouTube iframe for autoplay */}
      {youtubeId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          title="music-player"
        />
      )}

      {song && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            borderRadius: "14px",
            p: "10px 14px",
            maxWidth: 400,
            position: "relative",
            overflow: "hidden",
            animation: "musicIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "@keyframes musicIn": {
              from: { opacity: 0, transform: "translateY(20px) scale(0.92)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
          }}
        >
          {/* Album art */}
          <Box
            component="img"
            src={song.thumbnail}
            alt="thumbnail"
            sx={{
              width: 56, height: 56, borderRadius: "10px", objectFit: "cover", flexShrink: 0,
              animation: "spin 8s linear infinite",
              "@keyframes spin": { from: { borderRadius: "50%" }, to: {} },
            }}
          />

          {/* Info */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {song.title}
            </Box>
            <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {song.author}
            </Box>
            <Box sx={{ fontSize: 10, color: "#7C3AED", mt: 0.25 }}>
              ♪ {song.requestedBy}
            </Box>
          </Box>

          {/* Progress bar */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0, left: 0,
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

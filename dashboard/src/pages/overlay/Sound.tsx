import { useEffect, useRef, useState } from "react";
import { Box, Slider, Stack, Typography } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useSocketEvent } from "@/hooks/useSocket";

interface PlaySoundData {
  url: string;
  name: string;
  redeemedBy?: string;
}

interface NowPlaying {
  name: string;
  redeemedBy?: string;
}

export function SoundOverlay() {
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);

  // Keep refs in sync so socket callback always uses latest value
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useSocketEvent<PlaySoundData>("play-sound", (data) => {
    audioRef.current?.pause();

    const audio = new Audio(data.url);
    audio.volume = mutedRef.current ? 0 : volumeRef.current / 100;
    audioRef.current = audio;

    setNowPlaying({ name: data.name, redeemedBy: data.redeemedBy });

    audio.play().catch(() => {});
    audio.onended = () => setNowPlaying(null);
  });

  const handleVolumeChange = (_: Event, v: number | number[]) => {
    const val = v as number;
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = mutedRef.current ? 0 : val / 100;
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.volume = next ? 0 : volumeRef.current / 100;
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        fontFamily: "'DM Sans', sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Volume control — bottom right, always visible for streamer */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          p: "10px 14px",
          width: 200,
          pointerEvents: "auto",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <Box
            onClick={toggleMute}
            sx={{ cursor: "pointer", color: muted ? "error.main" : "primary.main", display: "flex" }}
          >
            {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            Volume
          </Typography>
          <Typography variant="caption" fontWeight={700} color="white">
            {muted ? "Muted" : `${volume}%`}
          </Typography>
        </Stack>
        <Slider
          size="small"
          value={volume}
          min={0}
          max={100}
          step={5}
          onChange={handleVolumeChange}
          sx={{ color: muted ? "error.main" : "primary.main" }}
        />
      </Box>

      {/* Now Playing toast — bottom left */}
      {nowPlaying && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            p: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            animation: "soundIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "@keyframes soundIn": {
              from: { opacity: 0, transform: "translateY(12px) scale(0.95)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "rgba(124,58,237,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VolumeUpIcon sx={{ fontSize: 18, color: "primary.main" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {nowPlaying.name}
            </Typography>
            {nowPlaying.redeemedBy && (
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>
                by {nowPlaying.redeemedBy}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
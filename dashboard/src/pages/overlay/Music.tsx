import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Slider, IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { api } from "@/hooks/useApi";
import type { SongRequestData, SongData, Configuration, MusicOverlaySettings } from "@/types/api";
import { resolveMusicTheme, DEFAULT_MUSIC_OVERLAY_SETTINGS, googleFontsUrl } from "../../../../helpers/overlayTheme";

interface SongProgress {
  percent: number;
  currentTime: number;
  duration: number;
}

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
  getVolume: () => number;
  isMuted: () => boolean;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isDefault, setIsDefault] = useState(false);
  const [theme, setTheme] = useState<MusicOverlaySettings>(DEFAULT_MUSIC_OVERLAY_SETTINGS);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const defaultSongsRef = useRef<SongData[]>([]);
  const defaultIndexRef = useRef(0);
  const seekingRef = useRef(false);

  const { socket } = useSocket();

  const playDefault = useCallback((index: number) => {
    const defaults = defaultSongsRef.current;
    if (defaults.length === 0) return;
    const s = defaults[index % defaults.length]!;
    defaultIndexRef.current = index % defaults.length;
    setIsDefault(true);
    setSong({ ...s, requestedBy: "" });
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get<SongRequestData[]>("/api/queue"),
      api.get<Configuration>("/api/config"),
    ]).then(([queue, config]) => {
      defaultSongsRef.current = config.defaultSongs ?? [];
      const resolvedTheme = resolveMusicTheme(config.overlaySettings?.music ?? DEFAULT_MUSIC_OVERLAY_SETTINGS);
      setTheme(resolvedTheme);
      // Load Google Font
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = googleFontsUrl(resolvedTheme.fontFamily);
      document.head.appendChild(link);
      if (queue[0]) {
        setIsDefault(false);
        setSong(queue[0]);
      } else {
        playDefault(0);
      }
    }).catch(() => {});
  }, [playDefault]);

  useSocketEvent<{ queue: SongRequestData[] }>("songRequest", (data) => {
    if (data.queue[0]) {
      setIsDefault(false);
      setSong(data.queue[0]);
    }
  });

  useSocketEvent<SongRequestData[]>("songPlayNext", (data) => {
    if (data[0]) {
      setIsDefault(false);
      setSong(data[0]);
      setProgress(0);
      setCurrentTime(0);
    } else {
      playDefault(defaultIndexRef.current);
    }
  });

  useSocketEvent<SongProgress>("currentSongProgress", (data) => {
    if (seekingRef.current) return;
    setProgress(data.percent ?? 0);
    setCurrentTime(data.currentTime ?? 0);
    setDuration(data.duration ?? 0);
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
      if (!player || seekingRef.current) return;
      const current = player.getCurrentTime();
      const dur = player.getDuration();
      if (!dur) return;
      const percent = (current / dur) * 100;
      setProgress(percent);
      setCurrentTime(current);
      setDuration(dur);
      if (!socket || isDefault) return;
      socket.emit("currentSongProgress", { percent, currentTime: current, duration: dur });
    }, 1000);
  }, [socket, stopProgressTimer, isDefault]);

  useEffect(() => {
    if (!song) {
      playerRef.current?.destroy();
      playerRef.current = null;
      stopProgressTimer();
      setIsPlaying(false);
      return;
    }

    loadYTApi(() => {
      if (!playerContainerRef.current) return;
      playerRef.current?.destroy();
      stopProgressTimer();

      const el = document.createElement("div");
      playerContainerRef.current.innerHTML = "";
      playerContainerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId: song.id,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.unMute();
            e.target.setVolume(volume);
            e.target.playVideo();
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTimer();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTimer();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              stopProgressTimer();
              setProgress(0);
              setCurrentTime(0);
              if (isDefault) {
                playDefault(defaultIndexRef.current + 1);
              } else {
                socket?.emit("songEnded");
              }
            }
          },
        },
      });
    });

    return () => { stopProgressTimer(); };
  }, [song?.id]);

  // Sync volume changes to player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(volume);
    if (volume === 0) {
      player.mute();
      setIsMuted(true);
    } else if (isMuted) {
      // keep muted state as-is
    } else {
      player.unMute();
    }
  }, [volume]);

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSkip = () => {
    if (isDefault) {
      playDefault(defaultIndexRef.current + 1);
    } else {
      socket?.emit("songEnded");
    }
  };

  const handleMuteToggle = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(volume);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (_: Event, val: number | number[]) => {
    const v = val as number;
    setVolume(v);

  };

  const handleSeekChange = (_: Event, val: number | number[]) => {
    seekingRef.current = true;
    setProgress(val as number);
  };

  const handleSeekCommit = (_: Event | React.SyntheticEvent, val: number | number[]) => {
    const player = playerRef.current;
    if (player && duration) {
      const targetTime = ((val as number) / 100) * duration;
      player.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    }
    seekingRef.current = false;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const hasContent = song !== null;
  const isClassic = theme.layout === "classic";

  // Shared controls (expanded panel) — same for both layouts
  const controlsPanel = (
    <>
      <Box sx={{ px: 0.5 }}>
        <Slider
          size="small"
          value={progress}
          min={0}
          max={100}
          disabled={!hasContent}
          onChange={handleSeekChange}
          onChangeCommitted={handleSeekCommit}
          sx={{
            color: theme.accentColor,
            height: 3,
            padding: "6px 0",
            "& .MuiSlider-thumb": { width: 10, height: 10, "&:hover, &.Mui-active": { boxShadow: "none" } },
            "& .MuiSlider-rail": { opacity: 0.2 },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: -0.5 }}>
          <Box sx={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{formatTime(currentTime)}</Box>
          <Box sx={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{formatTime(duration)}</Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <span>
            <IconButton size="small" onClick={handlePlayPause} disabled={!hasContent} sx={{ color: "#fff", p: 0.5 }}>
              {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Skip">
          <span>
            <IconButton size="small" onClick={handleSkip} disabled={!hasContent} sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}>
              <SkipNextIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
          <span>
            <IconButton size="small" onClick={handleMuteToggle} disabled={!hasContent} sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}>
              {isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
        <Slider
          size="small"
          value={isMuted ? 0 : volume}
          min={0}
          max={100}
          disabled={!hasContent}
          onChange={handleVolumeChange}
          sx={{
            flex: 1,
            color: "rgba(255,255,255,0.5)",
            height: 3,
            ml: 0.5,
            "& .MuiSlider-thumb": { width: 10, height: 10, "&:hover, &.Mui-active": { boxShadow: "none" } },
            "& .MuiSlider-rail": { opacity: 0.2 },
          }}
        />
        <Box sx={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 24, textAlign: "right" }}>
          {isMuted ? "0" : volume}%
        </Box>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: theme.position.startsWith("top") ? "flex-start" : "flex-end",
        justifyContent: theme.position.endsWith("right") ? "flex-end" : "flex-start",
        p: 2,
        background: "transparent",
        fontFamily: `'${theme.fontFamily}', sans-serif`,
        pointerEvents: "none",
      }}
    >
      {/* Hidden YT player */}
      <Box
        ref={playerContainerRef}
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          "& iframe": { width: "1px !important", height: "1px !important" },
        }}
      />

      {isClassic ? (
        /* ── Manao Classic layout ─────────────────────────────────────────── */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0, pointerEvents: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 0, alignItems: "flex-end" }}>
            {/* Spinning disc — outside card */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "99999px",
                flexShrink: 0,
                overflow: "hidden",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isPlaying ? "spin 10s linear infinite" : "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                border: "2px solid rgba(255,255,255,0.1)",
                zIndex: 1,
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
                mr: 1
              }}
            >
              {song?.thumbnail ? (
                <Box component="img" src={song.thumbnail} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ fontSize: 28 }}>♪</Box>
              )}
            </Box>

            {/* Song info card — thumbnail as blurred bg */}
            <Box
              onClick={() => setExpanded((v) => !v)}
              sx={{
                position: "relative",
                width: 480,
                borderRadius: `${theme.borderRadius}px`,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
            >
              {/* Blurred thumbnail background */}
              {song?.thumbnail && (
                <Box
                  component="img"
                  src={song.thumbnail}
                  alt=""
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(20px) brightness(0.4) saturate(1.5)",
                    transform: "scale(1.2)",
                  }}
                />
              )}
              {/* Overlay tint */}
              <Box sx={{ position: "absolute", inset: 0, background: theme.bgColor }} />

              {/* Content */}
              <Box
                sx={{
                  position: "relative",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minHeight: 76,
                }}
              >
                <Box sx={{ fontSize: 18, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {song?.title ?? "No song playing"}
                </Box>
                {song?.author && (
                  <Box sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {song.author}
                  </Box>
                )}
                {isDefault && (
                  <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>› Default playlist</Box>
                )}

                {/* Progress bar — bottom of card */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${progress}%`,
                    background: theme.accentColor,
                    transition: "width 1s linear",
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Expanded controls */}
          {expanded && (
            <Box
              sx={{
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(12px)",
                borderRadius: `0 0 ${theme.borderRadius}px ${theme.borderRadius}px`,
                px: 1.5,
                pb: 1,
                ml: "80px",
              }}
            >
              {controlsPanel}
            </Box>
          )}
        </Box>
      ) : (
        /* ── Manao v5 (default) layout ────────────────────────────────────── */
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: theme.bgColor,
            backdropFilter: "blur(12px)",
            borderRadius: `${theme.borderRadius}px`,
            p: "10px 14px 8px",
            width: 320,
            position: "relative",
            overflow: "hidden",
            pointerEvents: "auto",
            outline: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Song info row */}
          <Box onClick={() => setExpanded((v) => !v)} sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "99999px",
                flexShrink: 0,
                overflow: "hidden",
                background: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isPlaying ? "spin 8s linear infinite" : "none",
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            >
              {song?.thumbnail ? (
                <Box component="img" src={song.thumbnail} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Box sx={{ fontSize: 20 }}>♪</Box>
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ fontSize: 13, fontWeight: 800, color: hasContent ? "#fff" : "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {song?.title ?? "No song playing"}
              </Box>
              {song?.author && (
                <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {song.author}
                </Box>
              )}
              <Box sx={{ fontSize: 10, color: isDefault ? "rgba(255,255,255,0.3)" : theme.accentColor }}>
                {hasContent ? (isDefault ? "♪ Default playlist" : `♪ ${song!.requestedBy}`) : "Waiting for requests…"}
              </Box>
            </Box>
          </Box>

          {/* Progress bar — always visible at bottom of card */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              width: `${progress}%`,
              background: theme.accentColor,
              transition: "width 1s linear",
              borderRadius: "0 2px 2px 0",
            }}
          />

          {/* Expanded controls */}
          {expanded && controlsPanel}
        </Box>
      )}
    </Box>
  );
}
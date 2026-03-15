import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { api } from "@/hooks/useApi";
import type { Configuration, MusicOverlaySettings, OverlayThemeId, OverlayPosition } from "@/types/api";
import {
  MUSIC_OVERLAY_PRESETS,
  DEFAULT_MUSIC_OVERLAY_SETTINGS,
  resolveMusicTheme,
  googleFontsUrl,
} from "../../../../helpers/overlayTheme";

const POSITION_LABELS: Record<OverlayPosition, string> = {
  "bottom-left": "↙ Bottom Left",
  "bottom-right": "↘ Bottom Right",
  "top-left": "↖ Top Left",
  "top-right": "↗ Top Right",
};

const FONT_OPTIONS = [
  "DM Sans",
  "Noto Serif Thai",
  "Inter",
  "Kanit",
  "Sarabun",
  "Prompt",
];

export function OverlaySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [music, setMusic] = useState<MusicOverlaySettings>(DEFAULT_MUSIC_OVERLAY_SETTINGS);

  const load = useCallback(async () => {
    try {
      const config = await api.get<Configuration>("/api/config");
      setMusic(config.overlaySettings?.music ?? DEFAULT_MUSIC_OVERLAY_SETTINGS);
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load Google Font preview when fontFamily changes
  useEffect(() => {
    const id = "overlay-font-preview";
    document.getElementById(id)?.remove();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = googleFontsUrl(music.fontFamily);
    document.head.appendChild(link);
  }, [music.fontFamily]);

  const handleThemeId = (id: OverlayThemeId) => {
    if (id === "custom") {
      setMusic((m) => ({ ...m, themeId: "custom" }));
    } else {
      setMusic({ ...MUSIC_OVERLAY_PRESETS[id] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.post("/api/config", {
        overlaySettings: { music },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const resolved = resolveMusicTheme(music);
  const isCustom = music.themeId === "custom";

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Overlay Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Customize the appearance of your stream overlays
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Music Overlay */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2.5 }}>
          <MusicNoteIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="h6" fontWeight={700}>Music Overlay</Typography>
        </Stack>

        {/* Theme picker */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Theme</Typography>
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            {(["manao-v5", "manao-classic", "custom"] as OverlayThemeId[]).map((id) => {
              const isSelected = music.themeId === id;
              const preset = id !== "custom" ? MUSIC_OVERLAY_PRESETS[id] : null;
              return (
                <Box
                  key={id}
                  onClick={() => handleThemeId(id)}
                  sx={{
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 2,
                    p: 1.5,
                    cursor: "pointer",
                    minWidth: 140,
                    background: isSelected ? "rgba(105,240,0,0.04)" : "transparent",
                    transition: "all 0.15s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  {/* Mini preview */}
                  {id === "manao-classic" ? (
                    // Classic: disc outside + blurred bg card
                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, mb: 1, height: 36 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)", mr: .25 }} />
                      <Box sx={{ flex: 1, height: 30, borderRadius: `${preset?.borderRadius ?? 8}px`, background: preset?.bgColor ?? "rgba(0,0,0,0.5)", position: "relative", overflow: "hidden", px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <Box sx={{ height: 4, borderRadius: 1, background: "rgba(255,255,255,0.5)", mb: 0.4, width: "65%" }} />
                        <Box sx={{ height: 3, borderRadius: 1, background: "rgba(255,255,255,0.25)", width: "45%" }} />
                        <Box sx={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "55%", background: preset?.accentColor ?? "#f50f0f", borderRadius: "0 1px 1px 0" }} />
                      </Box>
                    </Box>
                  ) : (
                    // Default: disc inside card
                    <Box
                      sx={{
                        height: 36,
                        borderRadius: `${preset?.borderRadius ?? 14}px`,
                        background: preset?.bgColor ?? "rgba(0,0,0,0.75)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        gap: 0.75,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box sx={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.4)", mb: 0.5, width: "70%" }} />
                        <Box sx={{ height: 3, borderRadius: 2, background: preset?.accentColor ?? "#69F000", width: "40%" }} />
                      </Box>
                      <Box sx={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "60%", background: preset?.accentColor ?? "#69F000" }} />
                    </Box>
                  )}
                  <Typography variant="caption" fontWeight={isSelected ? 700 : 400} color={isSelected ? "primary.main" : "text.secondary"}>
                    {id === "manao-v5" ? "Manao v5" : id === "manao-classic" ? "Manao Classic" : "Custom"}
                  </Typography>
                  {isSelected && <Chip label="Selected" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Position */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Position</Typography>
          <ToggleButtonGroup
            value={music.position}
            exclusive
            onChange={(_, v) => v && setMusic((m) => ({ ...m, themeId: "custom", position: v }))}
            size="small"
          >
            {(Object.entries(POSITION_LABELS) as [OverlayPosition, string][]).map(([val, label]) => (
              <ToggleButton key={val} value={val} sx={{ fontSize: "0.75rem", px: 1.5 }}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Custom fields — always visible but disabled for presets */}
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            {/* Accent color */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Accent Color</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  component="input"
                  type="color"
                  value={resolved.accentColor.startsWith("rgba") ? "#69f000" : resolved.accentColor}
                  disabled={!isCustom}
                  onChange={(e) => setMusic((m) => ({ ...m, accentColor: e.target.value }))}
                  sx={{
                    width: 40,
                    height: 36,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    cursor: isCustom ? "pointer" : "not-allowed",
                    p: 0.25,
                    background: "transparent",
                    opacity: isCustom ? 1 : 0.4,
                  }}
                />
                <TextField
                  size="small"
                  value={resolved.accentColor}
                  disabled={!isCustom}
                  onChange={(e) => setMusic((m) => ({ ...m, accentColor: e.target.value }))}
                  sx={{ flex: 1 }}
                  inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
                />
              </Stack>
            </Box>

            {/* Background color */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Background Color</Typography>
              <TextField
                size="small"
                fullWidth
                value={resolved.bgColor}
                disabled={!isCustom}
                onChange={(e) => setMusic((m) => ({ ...m, bgColor: e.target.value }))}
                inputProps={{ style: { fontFamily: "monospace", fontSize: 13 } }}
                helperText="Supports rgba()"
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            {/* Font */}
            <FormControl size="small" sx={{ flex: 1 }} disabled={!isCustom}>
              <InputLabel>Font Family</InputLabel>
              <Select
                value={FONT_OPTIONS.includes(resolved.fontFamily) ? resolved.fontFamily : "custom"}
                label="Font Family"
                onChange={(e) => {
                  if (e.target.value !== "custom") setMusic((m) => ({ ...m, fontFamily: e.target.value }));
                }}
              >
                {FONT_OPTIONS.map((f) => (
                  <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custom font input */}
            <TextField
              size="small"
              label="Custom font name"
              disabled={!isCustom}
              value={resolved.fontFamily}
              onChange={(e) => setMusic((m) => ({ ...m, fontFamily: e.target.value }))}
              helperText="Google Fonts name"
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* Border radius */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Border Radius — {resolved.borderRadius}px
            </Typography>
            <Slider
              value={resolved.borderRadius}
              min={0}
              max={32}
              disabled={!isCustom}
              onChange={(_, v) => setMusic((m) => ({ ...m, borderRadius: v as number }))}
              sx={{ maxWidth: 300 }}
            />
          </Box>
        </Stack>

        {/* Live preview */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Preview</Typography>
          <Box
            sx={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              display: "flex",
              alignItems: [
                resolved.position.startsWith("top") ? "flex-start" : "flex-end",
              ],
              justifyContent: [
                resolved.position.endsWith("right") ? "flex-end" : "flex-start",
              ],
              minHeight: 120,
            }}
          >
            {resolved.layout === "classic" ? (
              // Classic layout preview
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0, fontFamily: `'${resolved.fontFamily}', sans-serif` }}>
                <Box sx={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)", zIndex: 1, mr: 1 }} />
                <Box sx={{ width: 260, position: "relative", borderRadius: `${resolved.borderRadius}px`, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(80,80,60,0.6), rgba(40,30,20,0.8))" }} />
                  <Box sx={{ position: "absolute", inset: 0, background: resolved.bgColor }} />
                  <Box sx={{ position: "relative", px: 2, py: 1.5, minHeight: 64 }}>
                    <Box sx={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "inherit", mb: 0.25 }}>Song Title</Box>
                    <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "inherit" }}>Artist Name</Box>
                    <Box sx={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "60%", background: resolved.accentColor }} />
                  </Box>
                </Box>
              </Box>
            ) : (
              // Default layout preview
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  background: resolved.bgColor,
                  backdropFilter: "blur(12px)",
                  borderRadius: `${resolved.borderRadius}px`,
                  p: "10px 14px",
                  width: 280,
                  position: "relative",
                  overflow: "hidden",
                  fontFamily: `'${resolved.fontFamily}', sans-serif`,
                }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ fontSize: 12, fontWeight: 800, color: "#fff", mb: 0.25, fontFamily: "inherit" }}>Song Title</Box>
                  <Box sx={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }}>Artist Name</Box>
                  <Box sx={{ fontSize: 9, color: resolved.accentColor, fontFamily: "inherit" }}>♪ Requested by viewer</Box>
                </Box>
                <Box sx={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "60%", background: resolved.accentColor }} />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
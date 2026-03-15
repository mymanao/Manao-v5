import React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { api } from "@/hooks/useApi";
import type {
  ChatOverlaySettings,
  Configuration,
  MusicOverlaySettings,
  OverlayPosition,
  OverlayThemeId,
  ChatThemeId,
} from "@/types/api";
import {
  ANIMATION_IN_OPTIONS,
  ANIMATION_OUT_OPTIONS,
  DEFAULT_CHAT_OVERLAY_SETTINGS,
  DEFAULT_MUSIC_OVERLAY_SETTINGS,
  MUSIC_OVERLAY_PRESETS,
  googleFontsUrl,
  CHAT_OVERLAY_PRESETS,
  resolveMusicTheme,
} from "../../../../helpers/overlayTheme";

const POSITION_LABELS: Record<OverlayPosition, string> = {
  "bottom-left": "↙ Bottom Left",
  "bottom-right": "↘ Bottom Right",
  "top-left": "↖ Top Left",
  "top-right": "↗ Top Right",
};

const FONT_OPTIONS = ["DM Sans", "Noto Serif Thai", "Inter", "Kanit", "Sarabun", "Prompt"];

export function OverlaySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [music, setMusic] = useState<MusicOverlaySettings>(DEFAULT_MUSIC_OVERLAY_SETTINGS);
  const [chat, setChat] = useState<ChatOverlaySettings>(DEFAULT_CHAT_OVERLAY_SETTINGS);

  const load = useCallback(async () => {
    try {
      const config = await api.get<Configuration>("/api/config");
      setMusic(config.overlaySettings?.music ?? DEFAULT_MUSIC_OVERLAY_SETTINGS);
      setChat(config.overlaySettings?.chat ?? DEFAULT_CHAT_OVERLAY_SETTINGS);
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      await api.post("/api/config", { overlaySettings: { music, chat } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChatThemeId = (id: ChatThemeId) => {
    if (id === "custom") {
      setChat((c) => ({ ...c, themeId: "custom" }));
    } else {
      setChat({ ...CHAT_OVERLAY_PRESETS[id] });
    }
  };

  const setC = <K extends keyof ChatOverlaySettings>(k: K, v: ChatOverlaySettings[K]) =>
    setChat((c) => ({ ...c, [k]: v }));

  const resolved = resolveMusicTheme(music);
  const isChatCustom = chat.themeId === "custom";
  const isCustom = music.themeId === "custom";

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
      <CircularProgress />
    </Box>
  );

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

      {/* ── Music Overlay ─────────────────────────────────────────────────── */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2.5 }}>
          <MusicNoteIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="h6" fontWeight={700}>Music Overlay</Typography>
        </Stack>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Theme</Typography>
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            {(["manao-v5", "manao-classic", "custom"] as OverlayThemeId[]).map((id) => {
              const isSelected = music.themeId === id;
              const preset = id !== "custom" ? MUSIC_OVERLAY_PRESETS[id] : null;
              return (
                <Box key={id} onClick={() => handleThemeId(id)} sx={{ border: "1px solid", borderColor: isSelected ? "primary.main" : "divider", borderRadius: 2, p: 1.5, cursor: "pointer", minWidth: 140, background: isSelected ? "rgba(105,240,0,0.04)" : "transparent", transition: "all 0.15s", "&:hover": { borderColor: "primary.main" } }}>
                  {id === "manao-classic" ? (
                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, mb: 1, height: 36 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", flexShrink: 0, border: "2px solid rgba(255,255,255,0.1)", mr: 0.25 }} />
                      <Box sx={{ flex: 1, height: 30, borderRadius: `${preset?.borderRadius ?? 8}px`, background: preset?.bgColor ?? "rgba(0,0,0,0.5)", position: "relative", overflow: "hidden", px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <Box sx={{ height: 4, borderRadius: 1, background: "rgba(255,255,255,0.5)", mb: 0.4, width: "65%" }} />
                        <Box sx={{ height: 3, borderRadius: 1, background: "rgba(255,255,255,0.25)", width: "45%" }} />
                        <Box sx={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "55%", background: preset?.accentColor ?? "#f50f0f", borderRadius: "0 1px 1px 0" }} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ height: 36, borderRadius: `${preset?.borderRadius ?? 14}px`, background: preset?.bgColor ?? "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.08)", mb: 1, display: "flex", alignItems: "center", px: 1, gap: 0.75, overflow: "hidden", position: "relative" }}>
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Position</Typography>
          <ToggleButtonGroup value={music.position} exclusive size="small"
                             onChange={(_, v) => v && setMusic((m) => ({ ...m, themeId: "custom", position: v }))}>
            {(Object.entries(POSITION_LABELS) as [OverlayPosition, string][]).map(([val, label]) => (
              <ToggleButton key={val} value={val} sx={{ fontSize: "0.75rem", px: 1.5 }}>{label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Accent Color</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box component="input" type="color"
                     value={resolved.accentColor.startsWith("rgba") ? "#69f000" : resolved.accentColor}
                     disabled={!isCustom}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMusic((m) => ({ ...m, accentColor: e.target.value }))}
                     sx={{ width: 40, height: 36, border: "1px solid", borderColor: "divider", borderRadius: 1, cursor: isCustom ? "pointer" : "not-allowed", p: 0.25, background: "transparent", opacity: isCustom ? 1 : 0.4 }}
                />
                <TextField size="small" value={resolved.accentColor} disabled={!isCustom}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMusic((m) => ({ ...m, accentColor: e.target.value }))}
                           sx={{ flex: 1 }} slotProps={{ htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
                />
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Background Color</Typography>
              <TextField size="small" fullWidth value={resolved.bgColor} disabled={!isCustom}
                         onChange={(e) => setMusic((m) => ({ ...m, bgColor: e.target.value }))}
                         slotProps={{ htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
                         helperText="Supports rgba()"
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ flex: 1 }} disabled={!isCustom}>
              <InputLabel>Font Family</InputLabel>
              <Select value={FONT_OPTIONS.includes(resolved.fontFamily) ? resolved.fontFamily : "custom"} label="Font Family"
                      onChange={(e) => { if (e.target.value !== "custom") setMusic((m) => ({ ...m, fontFamily: e.target.value })); }}>
                {FONT_OPTIONS.map((f) => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Custom font name" disabled={!isCustom} value={resolved.fontFamily}
                       onChange={(e) => setMusic((m) => ({ ...m, fontFamily: e.target.value }))}
                       helperText="Google Fonts name" sx={{ flex: 1 }}
            />
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Border Radius — {resolved.borderRadius}px
            </Typography>
            <Slider value={resolved.borderRadius} min={0} max={32} disabled={!isCustom}
                    onChange={(_, v) => setMusic((m) => ({ ...m, borderRadius: v as number }))}
                    sx={{ maxWidth: 300 }}
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Preview</Typography>
          <Box sx={{ background: "rgba(255,255,255,0.02)", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 3, display: "flex", alignItems: resolved.position.startsWith("top") ? "flex-start" : "flex-end", justifyContent: resolved.position.endsWith("right") ? "flex-end" : "flex-start", minHeight: 120 }}>
            {resolved.layout === "classic" ? (
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, background: resolved.bgColor, backdropFilter: "blur(12px)", borderRadius: `${resolved.borderRadius}px`, p: "10px 14px", width: 280, position: "relative", overflow: "hidden", fontFamily: `'${resolved.fontFamily}', sans-serif` }}>
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

      {/* ── Chat Overlay ───────────────────────────────────────────────────── */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2.5 }}>
          <ChatIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="h6" fontWeight={700}>Chat Overlay</Typography>
        </Stack>

        {/* Chat Theme picker */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Theme</Typography>
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            {(["manao-v5", "manao-classic", "lucian", "custom"] as ChatThemeId[]).map((id) => {
              const isSelected = chat.themeId === id;
              const preset = id !== "custom" ? CHAT_OVERLAY_PRESETS[id] : null;
              return (
                <Box key={id} onClick={() => handleChatThemeId(id)} sx={{ border: "1px solid", borderColor: isSelected ? "primary.main" : "divider", borderRadius: 2, p: 1.5, cursor: "pointer", minWidth: 140, background: isSelected ? "rgba(105,240,0,0.04)" : "transparent", transition: "all 0.15s", "&:hover": { borderColor: "primary.main" } }}>
                  {/* Mini preview */}
                  {id === "lucian" ? (
                    <Box sx={{ height: 52, mb: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", overflow: "hidden" }}>
                      {/* Row 1 — username line */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", width: "100%" }}>
                        <Box sx={{ height: 5, borderRadius: 1, background: "rgba(255,200,100,0.9)", width: "40%" }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.5)", transform: "rotate(-15deg)", flexShrink: 0 }} />
                      </Box>
                      {/* Row 2 — message card with triangle */}
                      <Box sx={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                        <Box sx={{ width: 0, height: 0, alignSelf: "flex-end", borderTop: "18px solid transparent", borderRight: "18px solid rgba(0,0,0,0.8)", borderBottom: "0px solid transparent", flexShrink: 0 }} />
                        <Box sx={{ background: "rgba(0,0,0,0.8)", borderRight: "5px solid rgba(255,255,255,0.55)", p: "5px 10px", flex: 1 }}>
                          <Box sx={{ height: 4, borderRadius: 1, background: "rgba(255,255,255,0.45)", width: "85%", ml: "auto" }} />
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ height: 52, borderRadius: `${preset?.borderRadius ?? 8}px`, background: preset?.bgColor ?? "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.06)", mb: 1, p: 1, display: "flex", flexDirection: "column", gap: 0.5, overflow: "hidden", position: "relative", borderLeft: `${Math.min(preset?.borderWidth ?? 3, 8)}px solid rgba(255,255,255,0.5)`, borderRight: "none", borderTop: "none", borderBottom: "none" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ height: 3, borderRadius: 1, background: "rgba(255,200,100,0.8)", width: "30%" }} />
                        <Box sx={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.3)", width: "55%" }} />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ height: 3, borderRadius: 1, background: "rgba(100,200,255,0.8)", width: "25%" }} />
                        <Box sx={{ height: 2, borderRadius: 1, background: "rgba(255,255,255,0.3)", width: "50%" }} />
                      </Box>
                    </Box>
                  )}
                  <Typography variant="caption" fontWeight={isSelected ? 700 : 400} color={isSelected ? "primary.main" : "text.secondary"}>
                    {id === "manao-v5" ? "Manao v5" : id === "manao-classic" ? "Manao Classic" : id === "lucian" ? "Lucian" : "Custom"}
                  </Typography>
                  {isSelected && <Chip label="Selected" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} />}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Alignment</Typography>
          <ToggleButtonGroup value={chat.align} exclusive size="small"
                             onChange={(_, v) => v && setC("align", v)}>
            {(["left", "center", "right"] as const).map((a) => (
              <ToggleButton key={a} value={a} sx={{ px: 2, textTransform: "capitalize" }}>{a}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Appearance</Typography>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, opacity: isChatCustom ? 1 : 0.6, pointerEvents: isChatCustom ? "auto" : "none" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Background Opacity — {Math.round(chat.backgroundOpacity * 100)}%
              </Typography>
              <Slider size="small" value={chat.backgroundOpacity} min={0} max={1} step={0.05}
                      onChange={(_, v) => setC("backgroundOpacity", v as number)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Text Color</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box component="input" type="color" value={chat.textColor}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setC("textColor", e.target.value)}
                     sx={{ width: 40, height: 36, border: "1px solid", borderColor: "divider", borderRadius: 1, p: 0.25, background: "transparent", cursor: "pointer" }}
                />
                <TextField size="small" value={chat.textColor} sx={{ flex: 1 }}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setC("textColor", e.target.value)}
                           slotProps={{ htmlInput: { style: { fontFamily: "monospace", fontSize: 13 } } }}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Font Size — {chat.fontSize}px</Typography>
              <Slider size="small" value={chat.fontSize} min={10} max={32}
                      onChange={(_, v) => setC("fontSize", v as number)} />
            </Box>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Font Weight</InputLabel>
              <Select value={chat.fontWeight} label="Font Weight"
                      onChange={(e) => setC("fontWeight", e.target.value)}>
                {["300", "400", "500", "600", "700", "800"].map((w) => (
                  <MenuItem key={w} value={w} sx={{ fontWeight: w }}>{w}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField size="small" label="Font Family" sx={{ flex: 1 }}
                       value={chat.fontFamily} onChange={(e) => setC("fontFamily", e.target.value)}
                       helperText="Google Fonts name" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Letter Spacing — {chat.letterSpacing}px</Typography>
              <Slider size="small" value={chat.letterSpacing} min={-2} max={8} step={0.5}
                      onChange={(_, v) => setC("letterSpacing", v as number)} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Border Radius — {chat.borderRadius}px</Typography>
              <Slider size="small" value={chat.borderRadius} min={0} max={32}
                      onChange={(_, v) => setC("borderRadius", v as number)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Border Width — {chat.borderWidth}px</Typography>
              <Slider size="small" value={chat.borderWidth} min={0} max={20}
                      onChange={(_, v) => setC("borderWidth", v as number)} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Max Width — {chat.maxWidth}px</Typography>
              <Slider size="small" value={chat.maxWidth} min={200} max={800}
                      onChange={(_, v) => setC("maxWidth", v as number)} />
            </Box>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Border Color</InputLabel>
              <Select value={chat.borderColorSource} label="Border Color"
                      onChange={(e) => setC("borderColorSource", e.target.value as "user" | "platform")}>
                <MenuItem value="user">User color</MenuItem>
                <MenuItem value="platform">Platform color</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            <FormControlLabel control={<Switch checked={chat.boxShadow} onChange={(_, v) => setC("boxShadow", v)} />} label="Box Shadow" />
            <FormControlLabel control={<Switch checked={chat.textShadow} onChange={(_, v) => setC("textShadow", v)} />} label="Text Shadow" />
            <FormControlLabel control={<Switch checked={chat.hideBadges} onChange={(_, v) => setC("hideBadges", v)} />} label="Hide Badges" />
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Behavior</Typography>
        <Stack spacing={2.5}>
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Auto-remove — {chat.timeoutMs === 0 ? "Never" : `${chat.timeoutMs / 1000}s`}
            </Typography>
            <Slider size="small" value={chat.timeoutMs} min={0} max={30000} step={1000}
                    marks={[{ value: 0, label: "Never" }, { value: 30000, label: "30s" }]}
                    onChange={(_, v) => setC("timeoutMs", v as number)} />
          </Box>
          <TextField size="small" type="number" label="Max Messages" sx={{ maxWidth: 160 }}
                     value={chat.maxMessages}
                     onChange={(e) => setC("maxMessages", Math.max(1, parseInt(e.target.value) || 50))}
                     slotProps={{ htmlInput: { min: 1, max: 200 } }}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Animation</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Animate In</InputLabel>
            <Select value={chat.animationIn} label="Animate In"
                    onChange={(e) => setC("animationIn", e.target.value as ChatOverlaySettings["animationIn"])}>
              {ANIMATION_IN_OPTIONS.map((a) => (
                <MenuItem key={a} value={a} sx={{ fontFamily: "monospace", fontSize: 13 }}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Animate Out</InputLabel>
            <Select value={chat.animationOut} label="Animate Out"
                    onChange={(e) => setC("animationOut", e.target.value as ChatOverlaySettings["animationOut"])}>
              {ANIMATION_OUT_OPTIONS.map((a) => (
                <MenuItem key={a} value={a} sx={{ fontFamily: "monospace", fontSize: 13 }}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Custom CSS</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Applied after all settings. Use <code>.chatbox-container</code>, <code>.username</code>, <code>.message</code>.
        </Typography>
        <TextField multiline rows={5} fullWidth size="small"
                   value={chat.customCSS}
                   onChange={(e) => setC("customCSS", e.target.value)}
                   slotProps={{ htmlInput: { style: { fontFamily: "monospace", fontSize: 12 } } }}
                   placeholder={`.chatbox-container {\n  /* custom styles */\n}`}
        />
      </Paper>
    </Box>
  );
}
import type { MusicOverlaySettings, OverlayThemeId } from "../core/types";

export const MUSIC_OVERLAY_PRESETS: Record<
  Exclude<OverlayThemeId, "custom">,
  MusicOverlaySettings
> = {
  "manao-v5": {
    themeId: "manao-v5",
    layout: "default",
    accentColor: "#69F000",
    bgColor: "rgba(0,0,0,0.75)",
    fontFamily: "DM Sans",
    borderRadius: 14,
    position: "bottom-left",
  },
  "manao-classic": {
    themeId: "manao-classic",
    layout: "classic",
    accentColor: "#f50f0f",
    bgColor: "rgba(0,0,0,0.5)",
    fontFamily: "Noto Serif Thai",
    borderRadius: 8,
    position: "bottom-left",
  },
};

export const DEFAULT_MUSIC_OVERLAY_SETTINGS: MusicOverlaySettings =
  MUSIC_OVERLAY_PRESETS["manao-v5"];

export const DEFAULT_OVERLAY_SETTINGS = {
  music: DEFAULT_MUSIC_OVERLAY_SETTINGS,
};

export function resolveMusicTheme(
  settings: MusicOverlaySettings
): MusicOverlaySettings {
  if (settings.themeId === "custom") return settings;
  return MUSIC_OVERLAY_PRESETS[settings.themeId] ?? settings;
}

export function googleFontsUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700;800&display=swap`;
}